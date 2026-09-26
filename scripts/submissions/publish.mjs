import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

export const APPROVAL_LABEL = "审核通过";
const COMMENT_MARKER = "<!-- submission-publication -->";
const statePath = () => join(process.env.RUNNER_TEMP, "submission.json");
const hasApproval = (issue) => issue.labels.some((label) => (label.name ?? label) === APPROVAL_LABEL);

async function getIssue(github, context) {
  return (await github.rest.issues.get({ ...context.repo, issue_number: context.payload.issue.number })).data;
}

export function assertApprovedSnapshot(snapshot, current) {
  if (current.state !== "open" || !hasApproval(current)) {
    throw new Error("投稿已关闭或「审核通过」标签已移除，本次发布已停止。");
  }
  if (snapshot.body !== current.body) {
    throw new Error("审核后投稿内容发生了修改，请重新检查，并移除再添加「审核通过」标签。");
  }
}

export async function authorize({ github, context, core }) {
  if (context.payload.action !== "labeled" || context.payload.label?.name !== APPROVAL_LABEL || context.payload.issue.pull_request) {
    throw new Error("只能通过投稿 Issue 的「审核通过」标签发布。");
  }
  // Triage can label Issues but cannot publish repository content.
  const actors = new Set([context.actor, process.env.GITHUB_TRIGGERING_ACTOR ?? context.actor]);
  for (const username of actors) {
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({ ...context.repo, username });
    if (!["admin", "maintain", "write"].includes(data.permission)) {
      throw new Error("审核发布需要仓库 Write、Maintain 或 Admin 权限。");
    }
  }
  core.setOutput("authorized", "true");
  assertApprovedSnapshot(context.payload.issue, await getIssue(github, context));
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function prepare({ github, context, core }) {
  const { createSubmission } = await import("./convert.mjs");
  const { parse } = await import("yaml");
  assertApprovedSnapshot(context.payload.issue, await getIssue(github, context));
  const submission = createSubmission(context.payload.issue);
  const originalContent = await readOptional(submission.path);
  if (originalContent !== null) {
    const metadata = parse(originalContent.split(/^---\s*$/m)[1] ?? "");
    if (metadata?.sourceIssue !== context.payload.issue.html_url) {
      throw new Error("目标文件不是由此投稿生成的，已停止发布以避免覆盖现有内容。");
    }
  }
  if (await readOptional(submission.otherPath) !== null) {
    throw new Error("此投稿已经按另一种类型发布，请保持原投稿类型。");
  }
  await writeFile(submission.path, submission.content);
  await writeFile(statePath(), JSON.stringify({ ...submission, originalContent }));
  core.setOutput("path", submission.path);
}

/** Commit only the validated file. Concurrent edits to other files are preserved. */
export async function commitSubmission({ github, context, submission }) {
  const branch = context.payload.repository.default_branch;
  for (let attempt = 0; attempt < 3; attempt++) {
    assertApprovedSnapshot(context.payload.issue, await getIssue(github, context));
    let existing;
    try {
      existing = (await github.rest.repos.getContent({ ...context.repo, path: submission.path, ref: branch })).data;
      if (existing.type !== "file" || existing.encoding !== "base64") throw new Error("目标路径不是可更新的内容文件。");
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    const currentContent = existing ? Buffer.from(existing.content, "base64").toString("utf8") : null;
    if (currentContent === submission.content) return; // Retry without duplicate commits.
    if (currentContent !== submission.originalContent) {
      throw new Error("文章文件在构建期间被修改，请检查最新版本后重新审核。");
    }
    try {
      await github.rest.repos.createOrUpdateFileContents({
        ...context.repo,
        branch,
        path: submission.path,
        sha: existing?.sha,
        message: `content: publish submission #${context.payload.issue.number}`,
        content: Buffer.from(submission.content).toString("base64"),
      });
      return;
    } catch (error) {
      if (error.status !== 409 || attempt === 2) throw error;
      // GitHub may reject simultaneous writes to the branch; reread before retrying.
    }
  }
}

export async function commit({ github, context }) {
  const submission = JSON.parse(await readFile(statePath(), "utf8"));
  // A successful build must not have changed the file that was reviewed.
  if (await readFile(submission.path, "utf8") !== submission.content) {
    throw new Error("待发布文件在构建期间发生变化，已停止发布。");
  }
  await access("dist/index.html");
  await commitSubmission({ github, context, submission });
}

export async function report({ github, context, core }, { published, deployed, path, pageUrl, error }) {
  const runUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
  const issue = await getIssue(github, context);
  const changed = issue.body !== context.payload.issue.body;
  let message;
  if (deployed && published) {
    const route = path.replace(/^src\/content\//, "").replace(/\.md$/, "/");
    const url = new URL(route, `${pageUrl.replace(/\/$/, "")}/`).href;
    message = `✅ 投稿已审核通过并发布：[查看网站内容](${url})。\n\n` +
      (changed ? "审核后 Issue 又有修改，网站保留的是本次审核时的版本，新的修改需要重新审核。\n\n" : "") +
      "后续如需修改，请重新打开此 Issue，编辑并保存内容，再联系管理员重新审核。更新后文章或资源的地址不变。";
  } else {
    message = published
      ? "⚠️ 投稿已写入仓库，但网站部署失败。修复部署问题后，可以重新运行此次工作流。"
      : "❌ 本次投稿未能发布。请根据下方错误提示检查投稿内容，修改后联系管理员重新审核。如不确定原因，可请管理员查看发布日志。";
    if (error) message += `\n\n错误信息：\n\n\`\`\`text\n${error.replaceAll("```", "'''")}\n\`\`\``;
  }
  const body = `${COMMENT_MARKER}\n${message}\n\n[查看发布日志](${runUrl})`;
  const comments = await github.paginate(github.rest.issues.listComments, { ...context.repo, issue_number: issue.number, per_page: 100 });
  const previous = comments.find((comment) => comment.user?.login === "github-actions[bot]" && comment.body?.startsWith(COMMENT_MARKER));
  if (previous) {
    await github.rest.issues.updateComment({ ...context.repo, comment_id: previous.id, body });
  } else {
    await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body });
  }
  if (published && deployed && !changed && hasApproval(issue) && issue.state === "open") {
    await github.rest.issues.update({ ...context.repo, issue_number: issue.number, state: "closed", state_reason: "completed" });
  }
  await core.summary.addRaw(message).addLink("发布日志", runUrl).write();
}

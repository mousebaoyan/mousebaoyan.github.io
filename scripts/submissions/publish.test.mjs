import assert from "node:assert/strict";
import test from "node:test";
import { APPROVAL_LABEL, assertApprovedSnapshot, authorize, commitSubmission, report } from "./publish.mjs";

function setup() {
  const issue = { number: 42, body: "已审核的正文", state: "open", labels: [{ name: APPROVAL_LABEL }] };
  const context = {
    actor: "reviewer", repo: { owner: "owner", repo: "repo" }, serverUrl: "https://github.com", runId: 123,
    payload: { action: "labeled", label: { name: APPROVAL_LABEL }, issue: structuredClone(issue), repository: { default_branch: "main" } },
  };
  const calls = { writes: [], comments: [], closed: [], permissions: [], outputs: {} };
  let file = null;
  const github = {
    rest: {
      issues: {
        get: async () => ({ data: issue }),
        listComments: () => {},
        createComment: async (args) => calls.comments.push(args),
        updateComment: async (args) => calls.comments.push(args),
        update: async (args) => calls.closed.push(args),
      },
      repos: {
        getCollaboratorPermissionLevel: async ({ username }) => { calls.permissions.push(username); return { data: { permission: "write" } }; },
        getContent: async () => {
          if (!file) throw Object.assign(new Error("Not found"), { status: 404 });
          return { data: file };
        },
        createOrUpdateFileContents: async (args) => {
          calls.writes.push(args);
          file = { type: "file", encoding: "base64", content: args.content, sha: "new-sha" };
        },
      },
    },
    paginate: async () => [],
  };
  const core = {
    setOutput: (key, value) => { calls.outputs[key] = value; },
    summary: { addRaw() { return this; }, addLink() { return this; }, async write() {} },
  };
  const submission = { path: "src/content/experiences/submission-42.md", content: "已构建的新文章", originalContent: null };
  return { github, context, core, issue, calls, submission };
}

test("only reviewers with write access can approve, even though triage can label", async () => {
  for (const permission of ["read", "triage", "none"]) {
    const env = setup();
    env.github.rest.repos.getCollaboratorPermissionLevel = async () => ({ data: { permission } });
    await assert.rejects(authorize(env), /权限/);
    assert.deepEqual(env.calls.outputs, {});
  }
  const env = setup();
  await authorize(env);
  assert.equal(env.calls.outputs.authorized, "true");
});

test("reruns check the user restarting the workflow as well as the original reviewer", async () => {
  const previous = process.env.GITHUB_TRIGGERING_ACTOR;
  process.env.GITHUB_TRIGGERING_ACTOR = "other-user";
  try {
    const env = setup();
    env.github.rest.repos.getCollaboratorPermissionLevel = async ({ username }) => ({ data: { permission: username === "reviewer" ? "admin" : "read" } });
    await assert.rejects(authorize(env), /权限/);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_TRIGGERING_ACTOR;
    else process.env.GITHUB_TRIGGERING_ACTOR = previous;
  }
});

test("wrong events and pull requests cannot publish", async () => {
  for (const change of [{ action: "edited" }, { label: { name: "经验贴" } }, { issue: { pull_request: {} } }]) {
    const env = setup();
    Object.assign(env.context.payload, change);
    await assert.rejects(authorize(env), /只能/);
  }
});

test("changed content, withdrawn approvals and closed Issues require fresh review", () => {
  const { issue, context } = setup();
  for (const change of [{ body: "作者新改的正文" }, { labels: [] }, { state: "closed" }]) {
    assert.throws(() => assertApprovedSnapshot(context.payload.issue, { ...issue, ...change }), /修改|关闭|移除/);
  }
});

test("commits target just the generated file and repeated approvals make no duplicate commits", async () => {
  const env = setup();
  await commitSubmission(env);
  await commitSubmission(env);
  assert.equal(env.calls.writes.length, 1);
  assert.equal(env.calls.writes[0].branch, "main");
  assert.equal(env.calls.writes[0].path, env.submission.path);
  assert.equal(Buffer.from(env.calls.writes[0].content, "base64").toString(), env.submission.content);
});

test("an edited submission updates the same file using its existing SHA", async () => {
  const env = setup();
  await commitSubmission(env);
  env.submission.originalContent = env.submission.content;
  env.submission.content = "管理员再次审核的内容";
  await commitSubmission(env);
  assert.equal(env.calls.writes.length, 2);
  assert.equal(env.calls.writes[1].sha, "new-sha");
  assert.equal(env.calls.writes[1].path, env.calls.writes[0].path);
});

test("manual changes to the article during the build are never overwritten", async () => {
  const env = setup();
  await commitSubmission(env);
  env.submission.content = "第二个并发版本";
  await assert.rejects(commitSubmission(env), /构建期间被修改/);
  assert.equal(env.calls.writes.length, 1);
});

test("approval is rechecked immediately before committing", async () => {
  const env = setup();
  env.issue.body = "作者在构建期间修改的内容";
  await assert.rejects(commitSubmission(env), /修改/);
  assert.equal(env.calls.writes.length, 0);
});

test("concurrent branch writes retry, while protected-branch errors propagate", async () => {
  const env = setup();
  const write = env.github.rest.repos.createOrUpdateFileContents;
  let attempts = 0;
  env.github.rest.repos.createOrUpdateFileContents = async (args) => {
    if (++attempts === 1) throw Object.assign(new Error("Conflict"), { status: 409 });
    return write(args);
  };
  await commitSubmission(env);
  assert.equal(attempts, 2);
  assert.equal(env.calls.writes.length, 1);

  const blocked = setup();
  blocked.github.rest.repos.createOrUpdateFileContents = async () => { throw Object.assign(new Error("Protected branch"), { status: 403 }); };
  await assert.rejects(commitSubmission(blocked), /Protected branch/);
});

test("branch conflicts are bounded and recheck approval on retry", async () => {
  const env = setup();
  let attempts = 0;
  env.github.rest.repos.createOrUpdateFileContents = async () => {
    attempts++;
    throw Object.assign(new Error("Conflict"), { status: 409 });
  };
  await assert.rejects(commitSubmission(env), /Conflict/);
  assert.equal(attempts, 3);
  attempts = 0;
  env.github.rest.repos.createOrUpdateFileContents = async () => {
    attempts++;
    env.issue.labels = [];
    throw Object.assign(new Error("Conflict"), { status: 409 });
  };
  await assert.rejects(commitSubmission(env), /移除/);
  assert.equal(attempts, 1);
});

test("a successful deployment returns a website link and closes the Issue", async () => {
  const env = setup();
  await report(env, { published: true, deployed: true, path: env.submission.path, pageUrl: "https://owner.github.io/repo/" });
  assert.match(env.calls.comments[0].body, /https:\/\/owner.github.io\/repo\/experiences\/submission-42\//);
  assert.equal(env.calls.closed[0].state, "closed");
});

test("build and deployment failures keep the Issue open and explain recovery", async () => {
  for (const published of [true, false]) {
    const env = setup();
    await report(env, { published, deployed: false, error: "缺少摘要" });
    assert.equal(env.calls.closed.length, 0);
    assert.match(env.calls.comments[0].body, published ? /部署失败/ : /未能发布/);
    assert.match(env.calls.comments[0].body, /缺少摘要/);
  }
});

test("a changed Issue remains open after deploying the earlier approved snapshot", async () => {
  const env = setup();
  env.issue.body = "部署期间又有修改";
  await report(env, { published: true, deployed: true, path: env.submission.path, pageUrl: "https://owner.github.io/" });
  assert.equal(env.calls.closed.length, 0);
  assert.match(env.calls.comments[0].body, /新的修改需要重新审核/);
});

test("status updates reuse the bot's comment and ignore user lookalikes", async () => {
  const env = setup();
  env.github.paginate = async () => [
    { id: 1, user: { login: "someone" }, body: "<!-- submission-publication -->" },
    { id: 2, user: { login: "github-actions[bot]" }, body: "<!-- submission-publication -->" },
  ];
  await report(env, { published: false, deployed: false });
  assert.equal(env.calls.comments[0].comment_id, 2);
});

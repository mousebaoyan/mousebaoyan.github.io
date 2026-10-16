import { createSubmission, getSubmissionAttachment } from "./convert.mjs";

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 30_000;

function checkedUrl(value, redirect = false) {
  if (!URL.canParse(value)) throw new Error("Markdown 附件请直接上传到 GitHub Issue，使用生成的 .md 或 .markdown 文件链接。");
  const url = new URL(value);
  const githubUpload = url.hostname === "github.com" && /^\/user-attachments\/files\/\d+\/[^/]+\.(?:md|markdown)$/i.test(url.pathname);
  const githubDownload = redirect && url.hostname === "objects.githubusercontent.com";
  if (url.protocol !== "https:" || url.username || url.password || url.port || (!githubUpload && !githubDownload)) {
    throw new Error("Markdown 附件请直接上传到 GitHub Issue，使用生成的 .md 或 .markdown 文件链接。");
  }
  return url;
}

/** Download once before building; commits use this exact validated snapshot. */
export async function createSubmissionFromIssue(issue, { fetch: fetchAttachment = globalThis.fetch } = {}) {
  const attachment = getSubmissionAttachment(issue);
  if (!attachment) return createSubmission(issue);
  let url = checkedUrl(attachment);
  const signal = AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS);
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetchAttachment(url.href, { redirect: "manual", signal });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get("location");
        if (!location) throw new Error("Markdown 附件下载重定向缺少地址。");
        url = checkedUrl(new URL(location, url).href, true);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Markdown 附件下载失败（HTTP ${response.status}），请确认附件公开可访问，必要时重新上传。`);
      }
      if (Number(response.headers.get("content-length")) > MAX_ATTACHMENT_BYTES) {
        await response.body?.cancel();
        throw new Error("Markdown 附件不能超过 2 MB；正文不另设字数限制。");
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of response.body ?? []) {
        size += chunk.byteLength;
        if (size > MAX_ATTACHMENT_BYTES) throw new Error("Markdown 附件不能超过 2 MB；正文不另设字数限制。");
        chunks.push(chunk);
      }
      let attachmentBody;
      try {
        attachmentBody = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
      } catch {
        throw new Error("Markdown 附件必须是 UTF-8 编码的文本文件，请转换编码后重新上传。");
      }
      if (attachmentBody.includes("\0")) throw new Error("Markdown 附件包含二进制内容，请上传 UTF-8 文本文件。");
      return createSubmission(issue, { attachmentBody });
    }
    throw new Error("Markdown 附件下载重定向次数过多，请重新上传附件。");
  } catch (error) {
    if (signal.aborted) throw new Error("Markdown 附件下载超时，请稍后重新审核。", { cause: error });
    if (error instanceof TypeError) throw new Error("Markdown 附件下载失败，请检查文件链接或稍后重新审核。", { cause: error });
    throw error;
  }
}

import { parseDocument } from "htmlparser2";
import { marked } from "marked";
import { LIMITS } from "./core.mjs";
const allowed = new Set(
  "p h1 h2 h3 h4 h5 h6 div span br hr strong b em i u s del ul ol li blockquote pre code table thead tbody tfoot tr th td a img sub sup".split(
    " ",
  ),
);
const discard = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "form",
  "input",
  "button",
  "svg",
  "math",
]);
const blocks = new Set(
  "p div h1 h2 h3 h4 h5 h6 li blockquote pre tr".split(" "),
);
export const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function readHtml(html) {
  if (html.length > LIMITS.textBytes * 2)
    throw new Error("HTML içeriği çok büyük.");
  const doc = parseDocument(html, { decodeEntities: true });
  function read(node) {
    if (node.type === "text")
      return { html: escape(node.data), text: node.data };
    if (discard.has(node.name)) return { html: "", text: "" };
    const children = (node.children || []).map(read),
      body = children.map((c) => c.html).join(""),
      text = children.map((c) => c.text).join("");
    if (node.type === "root") return { html: body, text };
    if (!allowed.has(node.name)) return { html: body, text };
    const attrs = node.attribs || {},
      attributes = [];
    if (node.name === "a" && /^(https?:\/\/|mailto:|#)/i.test(attrs.href || ""))
      attributes.push(`href="${escape(attrs.href)}" rel="noreferrer"`);
    if (node.name === "img") {
      if (
        !/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(
          attrs.src || "",
        )
      )
        return { html: "", text: attrs.alt || "" };
      attributes.push(
        `src="${escape(attrs.src)}" alt="${escape(attrs.alt || "")}"`,
      );
    }
    const prefix = `<${node.name}${attributes.length ? " " + attributes.join(" ") : ""}>`;
    return {
      html:
        prefix +
        (["br", "hr", "img"].includes(node.name)
          ? ""
          : body + `</${node.name}>`),
      text:
        node.name === "br" || node.name === "hr"
          ? "\n"
          : node.name === "td" || node.name === "th"
            ? text + "\t"
            : blocks.has(node.name)
              ? text + "\n\n"
              : text,
    };
  }
  const result = read(doc);
  result.text = result.text.replace(/\n{3,}/g, "\n\n").trim();
  return result;
}
export function readMarkdown(text) {
  return readHtml(marked.parse(text, { async: false }));
}
export function htmlDocument(content, title) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><title>${escape(title)}</title><style>body{font:16px/1.75 system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;color:#172a35}table{border-collapse:collapse;max-width:100%}td,th{border:1px solid #ccd5da;padding:8px}img{max-width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f3f5f6;padding:20px}a{color:#08798b}</style></head><body>${content}</body></html>`;
}

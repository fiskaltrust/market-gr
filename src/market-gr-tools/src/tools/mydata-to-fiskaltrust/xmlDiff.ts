/**
 * Normalizes an InvoicesDoc XML so cosmetic differences (whitespace,
 * attribute order, comments, empty elements) don't show up in the diff. The
 * normalized output is a re-serialized DOM with consistent indentation and
 * sorted attributes.
 *
 * Monaco's DiffEditor handles diffing internally — this module is only here
 * to pre-normalize the two sides so the diff doesn't fixate on formatting.
 */
export function normalizeXml(raw: string): string {
  if (!raw.trim()) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    // Couldn't parse — fall back to the raw text so the user still sees
    // *something* in the diff. Strip trailing whitespace per line for sanity.
    return raw.replace(/[ \t]+$/gm, '').trim();
  }

  return serializeNode(doc.documentElement, 0).trimEnd();
}

function serializeNode(node: Element, depth: number): string {
  const indent = '  '.repeat(depth);
  const tag = node.tagName;
  const attrs = serializeAttrs(node);

  const children = Array.from(node.childNodes).filter(isMeaningful);
  if (children.length === 0) {
    return `${indent}<${tag}${attrs}/>\n`;
  }

  const onlyText = children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
  if (onlyText) {
    const text = (children[0].textContent ?? '').trim();
    return `${indent}<${tag}${attrs}>${escapeText(text)}</${tag}>\n`;
  }

  let out = `${indent}<${tag}${attrs}>\n`;
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      out += serializeNode(child as Element, depth + 1);
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? '').trim();
      if (text) out += `${'  '.repeat(depth + 1)}${escapeText(text)}\n`;
    }
  }
  out += `${indent}</${tag}>\n`;
  return out;
}

function serializeAttrs(node: Element): string {
  const attrs = Array.from(node.attributes)
    .map((a) => ({ name: a.name, value: a.value }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (attrs.length === 0) return '';
  return ' ' + attrs.map((a) => `${a.name}="${escapeAttr(a.value)}"`).join(' ');
}

function isMeaningful(node: Node): boolean {
  if (node.nodeType === Node.COMMENT_NODE) return false;
  if (node.nodeType === Node.TEXT_NODE) {
    return Boolean(node.textContent?.trim());
  }
  return true;
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

import type { Monaco } from '@monaco-editor/react';

let registered = false;

/** Minimal slice of Monaco's editor model we touch from the XML formatter. */
interface FormatTextModel {
  getValue(): string;
  getFullModelRange(): unknown;
}

/**
 * Registers Monaco document formatters that aren't built in. Idempotent —
 * called from CodeBlock's beforeMount on every mount, only fires once per
 * page load.
 *
 * Monaco ships a JSON formatter out of the box (Shift+Alt+F just works);
 * this module adds an XML formatter on top.
 */
export function registerFormatters(monaco: Monaco): void {
  if (registered) return;
  registered = true;

  monaco.languages.registerDocumentFormattingEditProvider('xml', {
    provideDocumentFormattingEdits(model: FormatTextModel) {
      try {
        const text = formatXml(model.getValue());
        return [{ range: model.getFullModelRange(), text }];
      } catch {
        return [];
      }
    },
  });
}

/**
 * DOM-based XML pretty-printer. Preserves attribute order (unlike
 * `normalizeXml` in xmlDiff.ts which deliberately sorts attrs for diffing).
 * Returns the input unchanged when parsing fails so the user never loses
 * what they typed.
 */
export function formatXml(raw: string): string {
  if (!raw.trim()) return raw;

  const declMatch = raw.match(/^\s*(<\?xml[^?]*\?>)/);
  const declaration = declMatch ? declMatch[1] : '';

  const doc = new DOMParser().parseFromString(raw, 'application/xml');
  if (doc.querySelector('parsererror')) return raw;

  const body = serializeNode(doc.documentElement, 0).trimEnd();
  return declaration ? `${declaration}\n${body}\n` : `${body}\n`;
}

function serializeNode(node: Element, depth: number): string {
  const indent = '  '.repeat(depth);
  const tag = node.tagName;
  const attrs = serializeAttrs(node);

  const children = Array.from(node.childNodes).filter(isMeaningful);

  if (children.length === 0) {
    return `${indent}<${tag}${attrs}/>\n`;
  }

  if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
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
  if (node.attributes.length === 0) return '';
  return (
    ' ' +
    Array.from(node.attributes)
      .map((a) => `${a.name}="${escapeAttr(a.value)}"`)
      .join(' ')
  );
}

function isMeaningful(node: Node): boolean {
  if (node.nodeType === Node.COMMENT_NODE) return false;
  if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim());
  return true;
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

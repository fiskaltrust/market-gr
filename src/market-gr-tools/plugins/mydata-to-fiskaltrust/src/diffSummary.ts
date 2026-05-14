/**
 * Walks two InvoicesDoc DOMs and classifies their differences into
 * actionable buckets: paths only on one side and per-path value changes.
 * The visual line-diff already shows everything; this just helps the user
 * understand *what kind* of differences are present without scanning the
 * whole document.
 */

export interface ValueChange {
  path: string;
  original: string;
  generated: string;
}

export interface DiffSummary {
  identical: boolean;
  onlyOriginal: string[];
  onlyGenerated: string[];
  valueChanges: ValueChange[];
}

const EMPTY_SUMMARY: DiffSummary = {
  identical: true,
  onlyOriginal: [],
  onlyGenerated: [],
  valueChanges: [],
};

export function summarizeXmlDiff(originalXml: string, generatedXml: string): DiffSummary {
  const original = collectLeafValues(originalXml);
  const generated = collectLeafValues(generatedXml);

  if (original === null || generated === null) {
    return EMPTY_SUMMARY;
  }

  const onlyOriginal: string[] = [];
  const onlyGenerated: string[] = [];
  const valueChanges: ValueChange[] = [];

  for (const [path, value] of original) {
    if (!generated.has(path)) {
      onlyOriginal.push(path);
    } else if (generated.get(path) !== value) {
      valueChanges.push({ path, original: value, generated: generated.get(path)! });
    }
  }
  for (const path of generated.keys()) {
    if (!original.has(path)) onlyGenerated.push(path);
  }

  onlyOriginal.sort();
  onlyGenerated.sort();
  valueChanges.sort((a, b) => a.path.localeCompare(b.path));

  const identical = onlyOriginal.length === 0 && onlyGenerated.length === 0 && valueChanges.length === 0;
  return { identical, onlyOriginal, onlyGenerated, valueChanges };
}

function collectLeafValues(xml: string): Map<string, string> | null {
  if (!xml.trim()) return new Map();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) return null;
  const result = new Map<string, string>();
  walk(doc.documentElement, doc.documentElement.localName, result);
  return result;
}

function walk(node: Element, path: string, out: Map<string, string>): void {
  for (const attr of Array.from(node.attributes)) {
    if (attr.name === 'xmlns' || attr.name.startsWith('xmlns:')) continue;
    out.set(`${path}/@${attr.localName}`, attr.value);
  }

  const childElements = Array.from(node.children);
  if (childElements.length === 0) {
    out.set(path, (node.textContent ?? '').trim());
    return;
  }

  const counts = new Map<string, number>();
  const indices = new Map<string, number>();
  for (const child of childElements) {
    counts.set(child.localName, (counts.get(child.localName) ?? 0) + 1);
  }

  for (const child of childElements) {
    const name = child.localName;
    const total = counts.get(name)!;
    let segment = name;
    if (total > 1) {
      const idx = indices.get(name) ?? 0;
      segment = `${name}[${idx}]`;
      indices.set(name, idx + 1);
    }
    walk(child, `${path}/${segment}`, out);
  }
}

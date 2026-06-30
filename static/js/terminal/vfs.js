// @ts-check

/**
 * Virtual filesystem helpers for the hero terminal.
 * @typedef {{ hidden: boolean, content: string }} TerminalFile
 * @typedef {{ cwd?: string, files: Record<string, TerminalFile> }} TerminalVfs
 */

/**
 * Tera string literals like "\n" can end up as two-character sequences in JSON.
 * @param {string} content
 * @returns {string}
 */
export function normalizeTerminalContent(content) {
  return content.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

/**
 * @param {TerminalVfs} vfs
 * @param {{ all?: boolean }} [options]
 * @returns {string[]}
 */
export function listFiles(vfs, { all = false } = {}) {
  if (!vfs?.files) {
    return [];
  }

  return Object.entries(vfs.files)
    .filter(([, meta]) => all || !meta.hidden)
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} query
 * @returns {{ name: string, content: string } | null}
 */
export function readFile(vfs, query) {
  const name = resolveFileName(vfs, query);
  if (!name) {
    return null;
  }

  return { name, content: normalizeTerminalContent(vfs.files[name].content) };
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} query
 * @param {{ strict?: boolean }} [options]
 * @returns {string | null}
 */
export function resolveFileName(vfs, query, { strict = false } = {}) {
  if (!vfs?.files || !query) {
    return null;
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const { files } = vfs;

  if (files[trimmed]) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  for (const name of Object.keys(files)) {
    if (name.toLowerCase() === lower) {
      return name;
    }
  }

  if (strict) {
    return null;
  }

  const candidates = new Set([trimmed]);
  if (!trimmed.endsWith(".md")) {
    candidates.add(`${trimmed}.md`);
  }
  if (!trimmed.startsWith(".")) {
    candidates.add(`.${trimmed}`);
  }

  for (const candidate of candidates) {
    if (files[candidate]) {
      return candidate;
    }
  }

  for (const name of Object.keys(files)) {
    const base = name.replace(/\.md$/i, "");
    if (base.toLowerCase() === lower) {
      return name;
    }
  }

  return null;
}

/**
 * @param {string[]} names
 * @returns {string}
 */
export function formatFileListing(names) {
  if (names.length === 0) {
    return "";
  }

  return names.join("  ");
}

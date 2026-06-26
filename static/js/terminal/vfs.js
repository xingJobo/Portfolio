/**
 * Virtual filesystem helpers for the hero terminal.
 * @typedef {{ hidden: boolean, content: string }} TerminalFile
 * @typedef {{ cwd?: string, files: Record<string, TerminalFile> }} TerminalVfs
 */

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

  return { name, content: vfs.files[name].content };
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} query
 * @returns {string | null}
 */
export function resolveFileName(vfs, query) {
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

  const lower = trimmed.toLowerCase();
  for (const name of Object.keys(files)) {
    const nameLower = name.toLowerCase();
    if (nameLower === lower) {
      return name;
    }

    const base = name.replace(/\.md$/i, "");
    if (base.toLowerCase() === lower) {
      return name;
    }
  }

  return null;
}

/**
 * @param {string[]} names
 * @param {number} [columns]
 * @returns {string}
 */
export function formatFileListing(names, columns = 2) {
  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0];
  }

  const colWidth = Math.max(...names.map((name) => name.length)) + 2;
  const rows = Math.ceil(names.length / columns);
  const lines = [];

  for (let row = 0; row < rows; row += 1) {
    const parts = [];
    for (let col = 0; col < columns; col += 1) {
      const name = names[row + col * rows];
      if (name) {
        parts.push(name.padEnd(colWidth));
      }
    }
    lines.push(parts.join("").trimEnd());
  }

  return lines.join("\n");
}

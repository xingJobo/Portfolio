// @ts-check

import { formatPrompt } from "./prompt.js";

const PROMPT_CMD_RE = /^([\w.-]+@[\w.-]+)(:[~\w./-]+)(\$\s)(.*)$/;

/**
 * Escape HTML and apply mockup-aligned syntax colors to terminal output.
 * @param {string} text
 * @returns {string}
 */
export function formatTerminalOutput(text) {
  if (!text) {
    return "";
  }

  return text
    .split("\n")
    .map((line) => formatTerminalLine(line))
    .join("");
}

/**
 * @param {import("./commands.js").TerminalVfs} vfs
 * @returns {string}
 */
export function formatPromptHtml(vfs) {
  const plain = formatPrompt(vfs);
  const match = plain.match(/^([\w.-]+@[\w.-]+)(:[~\w./-]+)(\$\s*)$/);

  if (!match) {
    return escapeHtml(plain);
  }

  return [
    `<span class="fauxsh__prompt-user">${escapeHtml(match[1])}</span>`,
    `<span class="fauxsh__prompt-path">${escapeHtml(match[2])}</span>`,
    `<span class="fauxsh__prompt-mark">${escapeHtml(match[3])}</span>`,
  ].join("");
}

/**
 * @param {string} line
 * @returns {string}
 */
function formatTerminalLine(line) {
  if (line === "") {
    return '<span class="fauxsh__line fauxsh__line--text"></span>';
  }

  if (PROMPT_CMD_RE.test(line)) {
    return formatPromptCommandLine(line);
  }

  const escaped = escapeHtml(line);

  if (/command not found|No such file|cat:/i.test(escaped)) {
    return `<span class="fauxsh__line fauxsh__line--error">${escaped}</span>`;
  }

  return `<span class="fauxsh__line fauxsh__line--text">${colorizeInline(escaped)}</span>`;
}

/**
 * @param {string} line
 * @returns {string}
 */
function formatPromptCommandLine(line) {
  const match = line.match(PROMPT_CMD_RE);

  if (!match) {
    return `<span class="fauxsh__line fauxsh__line--cmd">${escapeHtml(line)}</span>`;
  }

  const command = match[4] ? colorizeInline(escapeHtml(match[4])) : "";

  return [
    '<span class="fauxsh__line fauxsh__line--cmd">',
    `<span class="fauxsh__prompt-user">${escapeHtml(match[1])}</span>`,
    `<span class="fauxsh__prompt-path">${escapeHtml(match[2])}</span>`,
    `<span class="fauxsh__prompt-mark">${escapeHtml(match[3])}</span>`,
    command,
    "</span>",
  ].join("");
}

/**
 * @param {string} line
 * @returns {string}
 */
function colorizeInline(line) {
  return line
    .split(/(\s+)/)
    .map((part) => colorizeToken(part))
    .join("");
}

/**
 * @param {string} token
 * @returns {string}
 */
function colorizeToken(token) {
  if (!token.trim()) {
    return token;
  }

  if (token.endsWith("/") || token === "projects") {
    return `<span class="fauxsh__token fauxsh__token--path">${token}</span>`;
  }

  if (/\.(md|yaml|yml|json|sh)$/i.test(token) || token.startsWith(".")) {
    return `<span class="fauxsh__token fauxsh__token--accent">${token}</span>`;
  }

  if (/^(ls|cat|help|clear|whoami|pwd)$/i.test(token)) {
    return `<span class="fauxsh__token fauxsh__token--cmd">${token}</span>`;
  }

  return token;
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

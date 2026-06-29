// @ts-check

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
    .join("\n");
}

/**
 * @param {string} line
 * @returns {string}
 */
function formatTerminalLine(line) {
  const escaped = escapeHtml(line);

  if (!escaped) {
    return "";
  }

  if (escaped.startsWith("$ ")) {
    return `<span class="hero-terminal__line hero-terminal__line--cmd">${escaped}</span>`;
  }

  if (/command not found|No such file|cat:/i.test(escaped)) {
    return `<span class="hero-terminal__line hero-terminal__line--error">${escaped}</span>`;
  }

  if (/^\s{2,}\S/.test(line) || /^[a-z].+\s{2,}/i.test(escaped)) {
    return `<span class="hero-terminal__line hero-terminal__line--text">${colorizeListing(escaped)}</span>`;
  }

  return `<span class="hero-terminal__line hero-terminal__line--text">${colorizeInline(escaped)}</span>`;
}

/**
 * @param {string} line
 * @returns {string}
 */
function colorizeListing(line) {
  return line
    .split(/(\s+)/)
    .map((part) => colorizeToken(part))
    .join("");
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
    return `<span class="hero-terminal__token hero-terminal__token--path">${token}</span>`;
  }

  if (/\.(md|yaml|yml|json|sh)$/i.test(token) || token.startsWith(".")) {
    return `<span class="hero-terminal__token hero-terminal__token--accent">${token}</span>`;
  }

  if (/^(ls|cat|help|clear|whoami|pwd)$/i.test(token)) {
    return `<span class="hero-terminal__token hero-terminal__token--cmd">${token}</span>`;
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

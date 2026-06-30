// @ts-check

/** @typedef {import("./commands.js").TerminalVfs} TerminalVfs */

const PROMPT_USER = "xingjobo";
const PROMPT_HOST = "portfolio";
const HOME_DIR = "/home/xingjobo";

/**
 * Bash-style PS1: xingjobo@portfolio:~$
 * @param {TerminalVfs} vfs
 * @returns {string}
 */
export function formatPrompt(vfs) {
  const cwd = vfs.cwd ?? HOME_DIR;
  let path = cwd;

  if (cwd === HOME_DIR) {
    path = "~";
  } else if (cwd.startsWith(`${HOME_DIR}/`)) {
    path = `~${cwd.slice(HOME_DIR.length)}`;
  }

  return `${PROMPT_USER}@${PROMPT_HOST}:${path}$ `;
}

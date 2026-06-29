// @ts-check

import { listFiles } from "./vfs.js";

const COMMANDS = ["cat", "clear", "help", "ls", "pwd", "whoami"];

/**
 * @typedef {import("./vfs.js").TerminalVfs} TerminalVfs
 * @typedef {{ line: string, list?: string[] }} CompletionResult
 */

/**
 * @param {string[]} items
 * @param {string} prefix
 * @returns {string[]}
 */
function matchPrefix(items, prefix) {
  const lower = prefix.toLowerCase();
  return items.filter((item) => item.toLowerCase().startsWith(lower));
}

/**
 * @param {string} line
 * @returns {string}
 */
function replaceLastToken(line, replacement) {
  const lastSpace = line.lastIndexOf(" ");
  if (lastSpace === -1) {
    const leading = line.match(/^\s*/)?.[0] ?? "";
    return `${leading}${replacement}`;
  }

  return `${line.slice(0, lastSpace + 1)}${replacement}`;
}

/**
 * @param {string[]} values
 * @returns {string}
 */
function longestCommonPrefix(values) {
  if (values.length === 0) {
    return "";
  }

  const first = values[0];
  let end = first.length;

  for (const value of values.slice(1)) {
    let index = 0;
    while (index < end && index < value.length && first[index] === value[index]) {
      index += 1;
    }
    end = index;
  }

  return first.slice(0, end);
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} line
 * @returns {string[]}
 */
export function getCompletions(vfs, line) {
  const trimmed = line.trimStart();
  const leading = line.slice(0, line.length - trimmed.length);
  const endsWithSpace = trimmed.endsWith(" ");
  const tokens = trimmed.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return [...COMMANDS];
  }

  if (tokens.length === 1 && !endsWithSpace) {
    return matchPrefix(COMMANDS, tokens[0]);
  }

  const command = tokens[0].toLowerCase();

  if (command === "cat") {
    const partial = endsWithSpace ? "" : tokens[tokens.length - 1] ?? "";
    const showHidden = partial.startsWith(".") || partial.includes("/.");
    const files = listFiles(vfs, { all: showHidden });
    return matchPrefix(files, partial);
  }

  if (command === "ls" && tokens.length >= 2) {
    const partial = endsWithSpace ? "" : tokens[tokens.length - 1] ?? "";
    if (partial.startsWith("-") || partial === "") {
      return matchPrefix(["-a"], partial);
    }
  }

  if (leading && tokens.length === 0) {
    return COMMANDS;
  }

  return [];
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} line
 * @returns {CompletionResult}
 */
export function completeLine(vfs, line) {
  const matches = getCompletions(vfs, line);

  if (matches.length === 0) {
    return { line };
  }

  if (matches.length === 1) {
    const completed = replaceLastToken(line, matches[0]);
    const addSpace = COMMANDS.includes(matches[0].toLowerCase());
    return { line: addSpace ? `${completed} ` : completed };
  }

  const shared = longestCommonPrefix(matches);
  const partial = line.trim().split(/\s+/).pop() ?? "";

  if (!shared || shared.length <= partial.length) {
    return { line, list: matches };
  }

  return { line: replaceLastToken(line, shared) };
}

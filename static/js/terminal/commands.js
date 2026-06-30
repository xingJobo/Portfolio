// @ts-check

import { formatFileListing, listFiles, readFile, resolveFileName } from "./vfs.js";

/**
 * @typedef {{ hidden: boolean, content: string }} TerminalFile
 * @typedef {{ cwd?: string, files: Record<string, TerminalFile> }} TerminalVfs
 * @typedef {{ lines: string[], clear?: boolean }} CommandResult
 */

const HELP_TEXT = [
  "Available commands:",
  "  ls          list files",
  "  cat         print file contents",
  "  clear       clears the terminal screen",
  "  help        show this message",
  "  whoami      print username",
  "  pwd         print working directory",
  "",
  "Tips:",
  "  ↑ / ↓       command history",
  "  Tab         complete command or filename",
].join("\n");

/**
 * @param {string} input
 * @returns {{ command: string, args: string[] }}
 */
export function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { command: "", args: [] };
  }

  const parts = trimmed.split(/\s+/);
  return { command: parts[0], args: parts.slice(1) };
}

/**
 * @param {TerminalVfs} vfs
 * @param {string} input
 * @returns {CommandResult}
 */
export function runCommand(vfs, input) {
  const { command, args } = parseCommand(input);

  if (!command) {
    return { lines: [] };
  }

  switch (command) {
    case "help":
      return { lines: [HELP_TEXT] };
    case "ls":
      return handleLs(vfs, args);
    case "cat":
      return handleCat(vfs, args);
    case "clear":
      return { lines: [], clear: true };
    case "whoami":
      return { lines: ["xingjobo"] };
    case "pwd":
      return { lines: [vfs.cwd ?? "/home/xingjobo"] };
    default:
      return { lines: [`sh: ${command}: command not found`] };
  }
}

/**
 * @param {string[]} args
 * @returns {{ showAll: boolean, paths: string[] }}
 */
function parseLsArgs(args) {
  let showAll = false;
  /** @type {string[]} */
  const paths = [];

  for (const arg of args) {
    if (arg.startsWith("-")) {
      if (arg.includes("a")) {
        showAll = true;
      }
    } else {
      paths.push(arg);
    }
  }

  return { showAll, paths };
}

/**
 * @param {TerminalVfs} vfs
 * @param {string[]} args
 * @returns {CommandResult}
 */
function handleLs(vfs, args) {
  const { showAll, paths } = parseLsArgs(args);

  if (paths.length === 0) {
    const names = listFiles(vfs, { all: showAll });
    return { lines: names.length ? [formatFileListing(names)] : [] };
  }

  const lines = paths.map((path) => {
    const name = resolveFileName(vfs, path, { strict: true });
    return name ?? `ls: cannot access '${path}': No such file or directory`;
  });

  return { lines };
}

/**
 * @param {TerminalVfs} vfs
 * @param {string[]} args
 * @returns {CommandResult}
 */
function handleCat(vfs, args) {
  if (args.length === 0) {
    return { lines: ["cat: missing operand"] };
  }

  const target = args.join(" ");
  const file = readFile(vfs, target);

  if (!file) {
    return { lines: [`cat: ${target}: No such file`] };
  }

  return { lines: [file.content] };
}

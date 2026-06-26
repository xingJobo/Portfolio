import { formatFileListing, listFiles, readFile } from "./vfs.js";

/**
 * @typedef {{ hidden: boolean, content: string }} TerminalFile
 * @typedef {{ cwd?: string, files: Record<string, TerminalFile> }} TerminalVfs
 * @typedef {{ lines: string[], clear?: boolean }} CommandResult
 */

const HELP_TEXT = [
  "Available commands:",
  "  ls [-a]     list files",
  "  cat FILE    print file contents",
  "  clear       clear the screen",
  "  help        show this message",
  "  whoami      print username",
  "  pwd         print working directory",
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
      return { lines: ["xingJobo"] };
    case "pwd":
      return { lines: [vfs.cwd ?? "/home/xingjobo"] };
    default:
      return { lines: [`sh: ${command}: command not found`] };
  }
}

/**
 * @param {TerminalVfs} vfs
 * @param {string[]} args
 * @returns {CommandResult}
 */
function handleLs(vfs, args) {
  const showAll = args.some((arg) => arg.includes("a"));
  const names = listFiles(vfs, { all: showAll });
  return { lines: [formatFileListing(names)] };
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

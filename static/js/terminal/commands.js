// @ts-check

import { formatFileListing, listFiles, readFile, resolveFileName } from "./vfs.js";

/**
 * @typedef {{ hidden: boolean, content: string }} TerminalFile
 * @typedef {{ cwd?: string, files: Record<string, TerminalFile> }} TerminalVfs
 * @typedef {{ lines: string[], clear?: boolean }} CommandResult
 * @typedef {(vfs: TerminalVfs, args: string[]) => CommandResult} CommandHandler
 */

/** @type {Record<string, { description: string, run: CommandHandler }>} */
const COMMAND_REGISTRY = {
  help: {
    description: "show this message",
    run() {
      return { lines: [buildHelpText()] };
    },
  },
  ls: {
    description: "list files",
    run: handleLs,
  },
  cat: {
    description: "print file contents",
    run: handleCat,
  },
  clear: {
    description: "clears the terminal screen",
    run() {
      return { lines: [], clear: true };
    },
  },
  whoami: {
    description: "print username",
    run() {
      return { lines: ["xingjobo"] };
    },
  },
  pwd: {
    description: "print working directory",
    run(vfs) {
      return { lines: [vfs.cwd ?? "/home/xingjobo"] };
    },
  },
};

/** @type {readonly string[]} */
export const COMMAND_NAMES = Object.keys(COMMAND_REGISTRY).sort();

/**
 * @returns {string}
 */
function buildHelpText() {
  const maxLen = Math.max(...COMMAND_NAMES.map((name) => name.length));
  const lines = ["Available commands:"];

  for (const name of COMMAND_NAMES) {
    const entry = COMMAND_REGISTRY[name];
    lines.push(`  ${name.padEnd(maxLen)} ${entry.description}`);
  }

  lines.push(
    "",
    "Tips:",
    "  ↑ / ↓       command history",
    "  Tab         complete command or filename",
  );

  return lines.join("\n");
}

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

  const entry = COMMAND_REGISTRY[command];

  if (!entry) {
    return { lines: [`sh: ${command}: command not found`] };
  }

  return entry.run(vfs, args);
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

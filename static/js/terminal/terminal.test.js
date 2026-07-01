import { describe, expect, it } from "vitest";

import { parseCommand, runCommand } from "./commands.js";
import { completeLine } from "./completion.js";
import { normalizeTerminalContent } from "./vfs.js";

/** @type {import("./vfs.js").TerminalVfs} */
const sampleVfs = {
  cwd: "/home/xingjobo",
  files: {
    "README.md": { hidden: false, content: "Welcome" },
    "about.md": { hidden: false, content: "# About" },
  },
};

describe("parseCommand", () => {
  it("returns empty command for blank input", () => {
    expect(parseCommand("")).toEqual({ command: "", args: [] });
    expect(parseCommand("   ")).toEqual({ command: "", args: [] });
  });

  it("splits command and arguments", () => {
    expect(parseCommand("cat about.md")).toEqual({
      command: "cat",
      args: ["about.md"],
    });
    expect(parseCommand("  ls  -a  ")).toEqual({
      command: "ls",
      args: ["-a"],
    });
  });
});

describe("normalizeTerminalContent", () => {
  it("converts escaped newlines and tabs", () => {
    expect(normalizeTerminalContent("line one\\nline two")).toBe("line one\nline two");
    expect(normalizeTerminalContent("a\\tb")).toBe("a\tb");
  });

  it("leaves real newlines unchanged", () => {
    expect(normalizeTerminalContent("already\nfine")).toBe("already\nfine");
  });
});

describe("runCommand", () => {
  it("returns help text", () => {
    const result = runCommand(sampleVfs, "help");

    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toContain("Available commands:");
    expect(result.lines[0]).toContain("help");
    expect(result.lines[0]).toContain("Tab");
  });

  it("reports unknown commands", () => {
    expect(runCommand(sampleVfs, "nope")).toEqual({
      lines: ["sh: nope: command not found"],
    });
  });

  it("requires a file operand for cat", () => {
    expect(runCommand(sampleVfs, "cat")).toEqual({
      lines: ["cat: missing operand"],
    });
  });

  it("reports missing files for cat", () => {
    expect(runCommand(sampleVfs, "cat missing.md")).toEqual({
      lines: ["cat: missing.md: No such file"],
    });
  });
});

describe("completeLine", () => {
  it("completes a command prefix with a trailing space", () => {
    expect(completeLine(sampleVfs, "h")).toEqual({ line: "help " });
  });
});

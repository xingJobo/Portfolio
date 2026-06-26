import { runCommand } from "./commands.js";
import { readFile } from "./vfs.js";

/**
 * @returns {import("./commands.js").TerminalVfs}
 */
function loadVfs() {
  const element = document.getElementById("terminal-fs");
  if (!element?.textContent) {
    return { cwd: "/home/xingjobo", files: {} };
  }

  return JSON.parse(element.textContent);
}

function bootMessage(vfs) {
  const readme = readFile(vfs, "README.md");
  if (!readme) {
    return "Type help to list commands.";
  }

  return readme.content;
}

document.addEventListener("alpine:init", () => {
  Alpine.data("heroTerminal", () => ({
    vfs: loadVfs(),
    output: "",
    line: "",

    init() {
      this.output = bootMessage(this.vfs);
      this.$nextTick(() => this.scrollOutput());
    },

    focusInput() {
      this.$nextTick(() => {
        this.$refs.input?.focus();
      });
    },

    scrollOutput() {
      this.$nextTick(() => {
        const output = this.$refs.output;
        if (output) {
          output.scrollTop = output.scrollHeight;
        }
      });
    },

    appendOutput(text) {
      if (!text) {
        return;
      }

      this.output = this.output ? `${this.output}\n${text}` : text;
    },

    runCommand() {
      const input = this.line.trim();
      if (!input) {
        return;
      }

      this.appendOutput(`$ ${input}`);

      const result = runCommand(this.vfs, input);

      if (result.clear) {
        this.output = "";
      } else {
        for (const line of result.lines) {
          this.appendOutput(line);
        }
      }

      this.line = "";
      this.scrollOutput();
      this.focusInput();
    },
  }));
});

import { completeLine } from "./completion.js";
import { runCommand } from "./commands.js";

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
  return runCommand(vfs, "help").lines.join("\n");
}

document.addEventListener("alpine:init", () => {
  Alpine.data("heroTerminal", () => ({
    vfs: loadVfs(),
    output: "",
    line: "",
    history: [],
    historyIndex: -1,
    historyDraft: "",

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

    resetHistoryNavigation() {
      this.historyIndex = -1;
      this.historyDraft = "";
    },

    pushHistory(command) {
      const last = this.history[this.history.length - 1];
      if (last !== command) {
        this.history.push(command);
      }
      this.resetHistoryNavigation();
    },

    historyUp() {
      if (this.history.length === 0) {
        return;
      }

      if (this.historyIndex === -1) {
        this.historyDraft = this.line;
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex -= 1;
      }

      this.line = this.history[this.historyIndex];
    },

    historyDown() {
      if (this.historyIndex === -1) {
        return;
      }

      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex += 1;
        this.line = this.history[this.historyIndex];
        return;
      }

      this.resetHistoryNavigation();
      this.line = this.historyDraft;
    },

    tabComplete() {
      const previous = this.line;
      const result = completeLine(this.vfs, this.line);
      this.line = result.line;

      if (result.list && result.line === previous) {
        this.appendOutput(result.list.join("  "));
        this.scrollOutput();
      }
    },

    handleKeydown(event) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.historyUp();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.historyDown();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        this.tabComplete();
      }
    },

    runCommand() {
      const input = this.line.trim();
      if (!input) {
        return;
      }

      this.pushHistory(input);
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

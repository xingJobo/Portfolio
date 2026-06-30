// @ts-check
/// <reference path="../global.d.ts" />

import { completeLine } from "./completion.js";
import { runCommand } from "./commands.js";
import { formatPromptHtml, formatTerminalOutput } from "./format.js";
import { formatPrompt } from "./prompt.js";
import { normalizeTerminalContent } from "./vfs.js";
/**
 * @returns {import("./commands.js").TerminalVfs}
 */
function loadVfs() {
  const element = document.getElementById("terminal-fs");
  if (!element?.textContent) {
    return { cwd: "/home/xingjobo", files: {} };
  }

  const vfs = JSON.parse(element.textContent);

  for (const file of Object.values(vfs.files)) {
    file.content = normalizeTerminalContent(file.content);
  }

  return vfs;
}

function bootMessage(vfs) {
  return runCommand(vfs, "help").lines.join("\n");
}

/**
 * @typedef {import("./commands.js").TerminalVfs} TerminalVfs
 * @typedef {{
 *   vfs: TerminalVfs,
 *   output: string,
 *   line: string,
 *   history: string[],
 *   historyIndex: number,
 *   historyDraft: string,
 *   inputFocused: boolean,
 *   $el: HTMLElement,
 *   $refs: { input?: HTMLInputElement, output?: HTMLElement },
 *   $nextTick: (callback: () => void) => void,
 *   init: () => void,
 *   focusInput: () => void,
 *   scrollOutput: () => void,
 *   appendOutput: (text: string) => void,
 *   resetHistoryNavigation: () => void,
 *   pushHistory: (command: string) => void,
 *   historyUp: () => void,
 *   historyDown: () => void,
 *   tabComplete: () => void,
 *   handleKeydown: (event: KeyboardEvent) => void,
 *   runCommand: () => void,
 * }} fauxshContext
 */

function fauxsh() {
  return {
    vfs: loadVfs(),
    output: "",
    line: "",
    history: /** @type {string[]} */ ([]),
    historyIndex: -1,
    historyDraft: "",
    inputFocused: false,

    get promptHtml() {
      return formatPromptHtml(this.vfs);
    },

    get prompt() {
      return formatPrompt(this.vfs);
    },

    get formattedOutput() {
      return formatTerminalOutput(this.output);
    },

    /** @this {fauxshContext} */
    init() {
      this.output = bootMessage(this.vfs);
      this.$el.classList.add("fauxsh--ready");
      if (this.$refs.input) {
        this.$refs.input.disabled = false;
      }
      this.$nextTick(() => {
        const output = this.$refs.output;
        if (output) {
          output.scrollTop = 0;
        }
      });
    },

    /** @this {fauxshContext} */
    focusInput() {
      this.$nextTick(() => {
        this.$refs.input?.focus();
      });
    },

    /** @this {fauxshContext} */
    scrollOutput() {
      this.$nextTick(() => {
        const output = this.$refs.output;
        if (output) {
          output.scrollTop = output.scrollHeight;
        }
      });
    },

    /** @this {fauxshContext} */
    appendOutput(text) {
      if (!text) {
        return;
      }

      this.output = this.output ? `${this.output}\n${text}` : text;
    },

    /** @this {fauxshContext} */
    resetHistoryNavigation() {
      this.historyIndex = -1;
      this.historyDraft = "";
    },

    /**
     * @this {fauxshContext}
     * @param {string} command
     */
    pushHistory(command) {
      const last = this.history[this.history.length - 1];
      if (last !== command) {
        this.history.push(command);
      }
      this.resetHistoryNavigation();
    },

    /** @this {fauxshContext} */
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

    /** @this {fauxshContext} */
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

    /** @this {fauxshContext} */
    tabComplete() {
      const previous = this.line;
      const result = completeLine(this.vfs, this.line);
      this.line = result.line;

      if (result.list && result.line === previous) {
        this.appendOutput(result.list.join("  "));
        this.scrollOutput();
      }
    },

    /**
     * @this {fauxshContext}
     * @param {KeyboardEvent} event
     */
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

    /** @this {fauxshContext} */
    runCommand() {
      const input = this.line.trim();
      if (!input) {
        return;
      }

      this.pushHistory(input);
      this.appendOutput(`${this.prompt}${input}`);

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
  };
}

document.addEventListener("alpine:init", () => {
  Alpine.data("fauxsh", fauxsh);
});

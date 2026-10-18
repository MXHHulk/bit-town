import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentUnit } from "@codemirror/language";
import { PythonRunner } from "../python/runner";
import { explainError } from "../python/friendlyErrors";
import type { RunResult } from "../python/protocol";
import type { Quest } from "../quests/types";

const $ = (id: string) => document.getElementById(id)!;

/** 右側的寫程式面板：編輯器、執行、顯示測試結果 */
export class CodePanel {
  private root = $("panel");
  private output = $("output");
  private hintEl = $("hint");
  private editor: EditorView;
  private runner = new PythonRunner((s) => ($("py-status").textContent = s));
  private quest: Quest | null = null;
  private resolveClose: ((solved: boolean) => void) | null = null;
  private solved = false;

  constructor() {
    this.editor = new EditorView({
      parent: $("editor"),
      extensions: [basicSetup, python(), oneDark, indentUnit.of("    ")],
    });
    $("btn-run").addEventListener("click", () => this.run());
    $("btn-hint").addEventListener("click", () => this.hintEl.classList.toggle("hidden"));
    $("btn-reset").addEventListener("click", () => this.quest && this.setCode(this.quest.starterCode));
    $("btn-close").addEventListener("click", () => this.close());
  }

  /** 打開關卡，等玩家關閉面板後回傳是否過關 */
  open(quest: Quest): Promise<boolean> {
    this.quest = quest;
    this.solved = false;
    $("panel-concept").textContent = quest.concept;
    $("panel-title").textContent = quest.title;
    $("panel-desc").innerHTML = quest.description;
    this.hintEl.textContent = `💡 ${quest.hint}`;
    this.hintEl.classList.add("hidden");
    this.output.innerHTML = "";
    this.setCode(quest.starterCode);
    this.root.classList.remove("hidden");
    this.editor.focus();
    return new Promise((resolve) => (this.resolveClose = resolve));
  }

  private setCode(code: string) {
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: code } });
  }

  private close() {
    this.root.classList.add("hidden");
    const resolve = this.resolveClose;
    this.resolveClose = null;
    resolve?.(this.solved);
  }

  private async run() {
    if (!this.quest) return;
    const button = $("btn-run") as HTMLButtonElement;
    button.disabled = true;
    try {
      const result = await this.runner.run(this.editor.state.doc.toString(), this.quest.tests);
      this.render(result);
    } finally {
      button.disabled = false;
    }
  }

  private render(result: RunResult) {
    const parts: string[] = [];
    if (result.stdout) {
      parts.push(`<div class="block"><div class="label">print 的輸出</div><pre>${escape(result.stdout)}</pre></div>`);
    }
    if (result.error) {
      parts.push(
        `<div class="block error"><div class="label">程式出錯了</div>
         <p>${escape(explainError(result.error))}</p>
         <pre class="raw">${escape(`${result.error.type}: ${result.error.message}`)}</pre></div>`,
      );
    }
    if (result.tests.length) {
      const passed = result.tests.filter((t) => t.passed).length;
      const rows = result.tests
        .map((t) => {
          const detail = t.error
            ? escape(explainError(t.error))
            : `<code>${escape(t.call)}</code> → 得到 <code>${escape(t.actual ?? "")}</code>，應該是 <code>${escape(t.expected)}</code>`;
          return `<li class="${t.passed ? "pass" : "fail"}">${t.passed ? "✅" : "❌"} ${escape(t.name)}<div class="detail">${detail}</div></li>`;
        })
        .join("");
      parts.push(`<div class="block"><div class="label">測試 ${passed} / ${result.tests.length}</div><ul class="tests">${rows}</ul></div>`);

      if (passed === result.tests.length) {
        this.solved = true;
        parts.push(`<div class="block success">🎉 全部通過！按右上角 ✕ 回到小鎮。</div>`);
      }
    }
    this.output.innerHTML = parts.join("");
  }
}

function escape(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** 畫面下方的對話框，一句一句播放 */
export class DialogBox {
  private root = document.getElementById("dialog")!;
  private nameEl = document.getElementById("dialog-name")!;
  private textEl = document.getElementById("dialog-text")!;
  private lines: string[] = [];
  private index = 0;
  private onDone: (() => void) | null = null;

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (this.isOpen && (e.code === "Space" || e.code === "KeyE" || e.code === "Enter")) {
        e.preventDefault();
        this.next();
      }
    });
    this.root.addEventListener("click", () => this.next());
  }

  get isOpen() {
    return !this.root.classList.contains("hidden");
  }

  show(name: string, lines: string[]): Promise<void> {
    this.nameEl.textContent = name;
    this.lines = lines;
    this.index = 0;
    this.textEl.textContent = lines[0];
    this.root.classList.remove("hidden");
    return new Promise((resolve) => (this.onDone = resolve));
  }

  private next() {
    this.index++;
    if (this.index < this.lines.length) {
      this.textEl.textContent = this.lines[this.index];
      return;
    }
    this.root.classList.add("hidden");
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }
}

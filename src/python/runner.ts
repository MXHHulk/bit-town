import type { TestCase } from "../quests/types";
import type { RunResult, WorkerMessage } from "./protocol";

const TIMEOUT_MS = 3000;

/** 管理 Python Worker：負責載入、執行、逾時就重開（處理無窮迴圈） */
export class PythonRunner {
  private worker!: Worker;
  private ready!: Promise<void>;
  private nextId = 1;
  private onStatus: (status: string) => void;

  constructor(onStatus: (status: string) => void) {
    this.onStatus = onStatus;
    this.spawn();
  }

  private spawn() {
    this.onStatus("Python 載入中…");
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.ready = new Promise((resolve, reject) => {
      const onMessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type === "ready") {
          this.worker.removeEventListener("message", onMessage);
          this.onStatus("Python 準備好了");
          resolve();
        } else if (e.data.type === "load-error") {
          this.onStatus("Python 載入失敗，請檢查網路");
          reject(new Error(e.data.message));
        }
      };
      this.worker.addEventListener("message", onMessage);
    });
  }

  async run(code: string, tests: TestCase[]): Promise<RunResult> {
    await this.ready;
    const id = this.nextId++;
    this.onStatus("執行中…");

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.worker.removeEventListener("message", onMessage);
        this.worker.terminate();
        this.spawn();
        resolve({
          stdout: "",
          error: { type: "TimeoutError", message: `超過 ${TIMEOUT_MS / 1000} 秒還沒跑完`, line: null },
          tests: [],
        });
      }, TIMEOUT_MS);

      const onMessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type !== "result" || e.data.id !== id) return;
        clearTimeout(timer);
        this.worker.removeEventListener("message", onMessage);
        this.onStatus("Python 準備好了");
        resolve(e.data.result);
      };
      this.worker.addEventListener("message", onMessage);
      this.worker.postMessage({ id, code, tests });
    });
  }
}

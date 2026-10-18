/// <reference lib="webworker" />
// 在 Web Worker 裡執行玩家的 Python，這樣無窮迴圈也不會讓整個遊戲當掉
import { loadPyodide, version, type PyodideInterface } from "pyodide";
import type { RunRequest, WorkerMessage } from "./protocol";

const HARNESS = String.raw`
import json, io, contextlib, traceback

FILENAME = "<你的程式>"

def _input_disabled(prompt=""):
    raise RuntimeError("這一關不需要 input()，請直接使用函式的參數")

def _format_err(e):
    line = None
    if isinstance(e, SyntaxError) and e.filename == FILENAME:
        line = e.lineno
    else:
        for frame in traceback.extract_tb(e.__traceback__):
            if frame.filename == FILENAME:
                line = frame.lineno
    return {"type": type(e).__name__, "message": str(e), "line": line}

def run_player_code(code, tests_json):
    result = {"stdout": "", "error": None, "tests": []}
    ns = {"__name__": "__main__", "input": _input_disabled}
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, FILENAME, "exec"), ns)
    except BaseException as e:
        result["error"] = _format_err(e)
    result["stdout"] = out.getvalue()

    if result["error"] is None:
        for t in json.loads(tests_json):
            item = {"name": t["name"], "call": t["call"], "expected": t["expected"]}
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    actual = eval(t["call"], ns)
                item["actual"] = repr(actual)
                item["passed"] = actual == eval(t["expected"])
            except BaseException as e:
                item["error"] = _format_err(e)
                item["passed"] = False
            result["tests"].append(item)
    return json.dumps(result, ensure_ascii=False)
`;

let pyodide: PyodideInterface;

async function init() {
  pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
  });
  pyodide.runPython(HARNESS);
  post({ type: "ready" });
}

function post(msg: WorkerMessage) {
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, code, tests } = event.data;
  const run = pyodide.globals.get("run_player_code");
  const json = run(code, JSON.stringify(tests)) as string;
  run.destroy();
  post({ type: "result", id, result: JSON.parse(json) });
};

init().catch((err) => post({ type: "load-error", message: String(err) }));

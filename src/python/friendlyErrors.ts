import type { PyError } from "./protocol";

/** 把 Python 的錯誤訊息翻成新手看得懂的話 */
export function explainError(err: PyError): string {
  const where = err.line ? `第 ${err.line} 行` : "程式裡";
  const msg = err.message;

  switch (err.type) {
    case "SyntaxError":
      if (msg.includes("expected ':'")) return `${where}好像少了冒號「:」。if、else、def、for 這些開頭的行，最後都要加冒號。`;
      if (msg.includes("unterminated string")) return `${where}的字串沒有關起來，記得引號要成對出現，例如 "hello"。`;
      if (msg.includes("invalid syntax")) return `${where}的寫法 Python 看不懂，檢查看看有沒有打錯字、少了括號或多了符號。`;
      return `${where}有語法錯誤：Python 沒辦法讀懂這行。`;
    case "IndentationError":
    case "TabError":
      return `${where}的縮排（行首的空白）不對。在 Python 裡，屬於 if / def 裡面的程式要往右縮 4 個空白。`;
    case "NameError": {
      const name = msg.match(/name '(.+?)' is not defined/)?.[1];
      return name
        ? `${where}用到了「${name}」，但 Python 不認識它。是不是拼錯字，或是還沒有先給它一個值？`
        : `${where}用到了 Python 不認識的名字。`;
    }
    case "TypeError":
      if (msg.includes("positional argument")) return `${where}呼叫函式時，給的參數數量和函式需要的不一樣。`;
      if (msg.includes("can only concatenate str")) return `${where}想把文字和數字直接用 + 接在一起。可以先用 str() 把數字轉成文字。`;
      return `${where}把不同型別的資料混在一起用了（例如文字和數字相加）。`;
    case "IndexError":
      return `${where}想拿超出範圍的位置。例如串列只有 3 格（位置 0、1、2），卻去拿第 3 號。`;
    case "KeyError":
      return `${where}在字典裡找不到 ${msg} 這個 key。`;
    case "ZeroDivisionError":
      return `${where}除以 0 了，數學上沒辦法這樣算。`;
    case "TimeoutError":
      return `程式跑太久停不下來，是不是寫出了無窮迴圈？檢查 while 的條件最後會不會變成 False。`;
    default:
      return `${where}發生了 ${err.type}：${msg}`;
  }
}

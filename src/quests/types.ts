export interface TestCase {
  /** 給玩家看的情境說明 */
  name: string;
  /** 要執行的 Python 運算式，例如 can_buy(30, 25) */
  call: string;
  /** 預期結果，寫成 Python 字面值，例如 True、"可樂"、[1, 2] */
  expected: string;
}

export interface Quest {
  id: string;
  chapter: number;
  /** 這關要教的程式概念 */
  concept: string;
  title: string;
  npcName: string;
  /** 接任務前的對話 */
  intro: string[];
  /** 任務說明（HTML） */
  description: string;
  starterCode: string;
  hint: string;
  tests: TestCase[];
  /** 全部測試通過後的對話 */
  success: string[];
}

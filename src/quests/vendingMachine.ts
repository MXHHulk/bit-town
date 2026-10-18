import type { Quest } from "./types";

export const vendingMachine: Quest = {
  id: "vending-machine",
  chapter: 2,
  concept: "第 2 章・if / else",
  title: "壞掉的販賣機",
  npcName: "阿明",
  intro: [
    "啊，你就是新搬來的工程師嗎？太好了！",
    "這台販賣機壞掉了⋯⋯我投了錢，它卻什麼都沒掉出來。",
    "聽說它裡面是用一段叫 can_buy 的程式在判斷「錢夠不夠」。可以幫我看看嗎？",
  ],
  description: `
    <p>販賣機用 <code>can_buy(money, price)</code> 判斷能不能出貨：</p>
    <ul>
      <li>投的錢 <b>大於或等於</b> 價格 → 回傳 <code>True</code></li>
      <li>錢不夠 → 回傳 <code>False</code></li>
    </ul>
    <p>把 <code>____</code> 換成正確的東西，再按「執行」。</p>
  `,
  starterCode: `def can_buy(money, price):
    # 錢夠的話，就可以買
    if money >= price:
        return ____
    else:
        return False


# 你也可以自己試試看，用 print 印出結果
print(can_buy(30, 25))
`,
  hint: "錢夠的時候要回傳「可以」。在 Python 裡，「是／對」寫成 True（第一個字母大寫）。",
  tests: [
    { name: "投 30 元，買 25 元的可樂", call: "can_buy(30, 25)", expected: "True" },
    { name: "投 20 元，買 25 元的可樂", call: "can_buy(20, 25)", expected: "False" },
    { name: "剛好投 25 元", call: "can_buy(25, 25)", expected: "True" },
    { name: "沒投錢", call: "can_buy(0, 15)", expected: "False" },
  ],
  success: [
    "哐啷！可樂掉出來了！",
    "原來 if 就像販賣機在問自己「錢夠嗎？」，然後決定要走哪條路。",
    "謝謝你！鎮上還有很多機器怪怪的，之後也拜託你了！",
  ],
};

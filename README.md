# 位元鎮 Bit Town

一款幫助**零基礎資工新生**邊玩邊學 Python 的網頁遊戲。

你是剛搬到位元鎮的新手工程師。鎮上的販賣機、麵包店、圖書館都靠程式運作，卻常常出問題。
走到鎮民身邊對話、接下委託，在遊戲裡寫真正的 Python 把機器修好。

> 靈感來自人機互動課程，以及 [fab24hr](https://fab24hr.com) 「在情境中學習」的設計。

## 怎麼玩

- 方向鍵 / WASD：移動
- 靠近頭上有「！」的人，按 **E** 對話
- 在右側編輯器寫程式，按「▶ 執行」跑測試，全部通過就過關

## 開發

需要 [Node.js](https://nodejs.org/) 20 以上。

```bash
npm install
npm run dev      # 開發伺服器 http://localhost:5173
npm run build    # 輸出到 dist/
```

## 技術

| 用途 | 套件 |
|---|---|
| 小鎮地圖、角色移動 | [Phaser](https://phaser.io/) |
| 程式編輯器 | [CodeMirror 6](https://codemirror.net/) |
| 在瀏覽器裡執行 Python | [Pyodide](https://pyodide.org/)（跑在 Web Worker，無窮迴圈 3 秒後自動中止） |
| 建置 | Vite + TypeScript |

## 專案結構

```
src/
  main.ts                 進入點，建立 Phaser 遊戲
  scenes/TownScene.ts     小鎮地圖、玩家、NPC
  ui/DialogBox.ts         對話框
  ui/CodePanel.ts         寫程式面板（編輯器、執行、測試結果）
  python/worker.ts        在 Worker 中執行玩家的 Python 並跑測試
  python/runner.ts        管理 Worker、逾時重開
  python/friendlyErrors.ts  把 Python 錯誤翻成新手看得懂的話
  quests/                 關卡資料（新增關卡就在這裡加檔案）
docs/GDD.md               遊戲設計文件
```

## 新增一個關卡

1. 在 `src/quests/` 新增檔案，照 `vendingMachine.ts` 的格式填寫對話、說明、起始程式碼和測試
2. 在 `src/quests/index.ts` 登記
3. 在 `TownScene.ts` 放一個 NPC，`questId` 指向新關卡

import Phaser from "phaser";
import { TownScene } from "./scenes/TownScene";
import "./style.css";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 640,
  backgroundColor: "#9ccc65",
  physics: { default: "arcade" },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TownScene],
});

// 開發模式下可以在瀏覽器 console 用 game 除錯
if (import.meta.env.DEV) Object.assign(window, { game });

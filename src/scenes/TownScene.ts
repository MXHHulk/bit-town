import Phaser from "phaser";
import { ui } from "../ui";
import { quests } from "../quests";

const SPEED = 180;
const TALK_DISTANCE = 70;
const FONT = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';

interface Npc {
  questId: string;
  body: Phaser.GameObjects.Arc;
  marker: Phaser.GameObjects.Text;
  onSolved: () => void;
}

type KeyName = "up" | "down" | "left" | "right" | "w" | "a" | "s" | "d";

/** 位元鎮主地圖。美術先用幾何圖形代替 */
export class TownScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private keys!: Record<KeyName, Phaser.Input.Keyboard.Key>;
  private npcs: Npc[] = [];
  private prompt!: Phaser.GameObjects.Text;
  private nearNpc: Npc | undefined;
  private busy = false;
  private solved = new Set<string>();

  constructor() {
    super("town");
  }

  create() {
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    // 地面與道路
    this.add.rectangle(width / 2, height / 2, width, height, 0x9ccc65);
    this.add.rectangle(width / 2, height / 2, width, 80, 0xd7ccc8);
    this.add.rectangle(width / 2, height / 2, 80, height, 0xd7ccc8);

    const walls = this.physics.add.staticGroup();
    const building = (x: number, y: number, w: number, h: number, color: number, label: string) => {
      const rect = this.add.rectangle(x, y, w, h, color).setStrokeStyle(3, 0x3e2723);
      walls.add(rect);
      this.add.text(x, y, label, { fontFamily: FONT, fontSize: "18px", color: "#ffffff" }).setOrigin(0.5);
      return rect;
    };

    building(160, 130, 200, 140, 0x8d6e63, "你的家");
    building(800, 130, 200, 140, 0xf06292, "麵包店（未開放）");
    building(160, 510, 200, 140, 0x5c6bc0, "圖書館（未開放）");
    const machine = building(780, 480, 60, 90, 0xe53935, "販賣機");

    // 阿明站在販賣機旁邊
    const amin = this.add.circle(700, 500, 18, 0xffb74d).setStrokeStyle(3, 0x3e2723);
    walls.add(amin);
    this.add.text(700, 524, "阿明", { fontFamily: FONT, fontSize: "14px", color: "#3e2723" }).setOrigin(0.5, 0);
    this.npcs.push({
      questId: "vending-machine",
      body: amin,
      marker: this.add
        .text(700, 462, "！", { fontFamily: FONT, fontSize: "26px", color: "#d50000", fontStyle: "bold" })
        .setOrigin(0.5),
      onSolved: () => machine.setFillStyle(0x43a047),
    });

    // 玩家
    this.player = this.add.rectangle(width / 2, height / 2, 26, 26, 0x29b6f6).setStrokeStyle(3, 0x01579b);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, walls);

    this.prompt = this.add
      .text(0, 0, "按 E 對話", {
        fontFamily: FONT,
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.keys = this.input.keyboard!.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
      w: "W",
      a: "A",
      s: "S",
      d: "D",
    }) as Record<KeyName, Phaser.Input.Keyboard.Key>;

    this.input.keyboard!.on("keydown-E", () => {
      if (!this.busy && this.nearNpc) void this.talk(this.nearNpc);
    });

    this.add.text(12, 10, "方向鍵 / WASD 移動，靠近頭上有「！」的人按 E", {
      fontFamily: FONT,
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 6, y: 4 },
    });
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.busy) {
      body.setVelocity(0, 0);
      return;
    }

    const k = this.keys;
    const vx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
    const vy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
    body.setVelocity(vx, vy);
    body.velocity.normalize().scale(SPEED);

    this.nearNpc = this.npcs.find(
      (n) => Phaser.Math.Distance.Between(this.player.x, this.player.y, n.body.x, n.body.y) < TALK_DISTANCE,
    );
    this.prompt.setVisible(!!this.nearNpc);
    if (this.nearNpc) this.prompt.setPosition(this.nearNpc.body.x, this.nearNpc.body.y - 72);
  }

  private async talk(npc: Npc) {
    const quest = quests[npc.questId];
    this.setBusy(true);

    if (this.solved.has(quest.id)) {
      await ui.dialog.show(quest.npcName, ["販賣機現在運作得很好，謝謝你！"]);
    } else {
      await ui.dialog.show(quest.npcName, quest.intro);
      const solved = await ui.codePanel.open(quest);
      if (solved) {
        this.solved.add(quest.id);
        npc.marker.setVisible(false);
        npc.onSolved();
        await ui.dialog.show(quest.npcName, quest.success);
      } else {
        await ui.dialog.show(quest.npcName, ["沒關係，想好了再來找我！"]);
      }
    }
    this.setBusy(false);
  }

  /** 對話或寫程式時暫停 Phaser 的鍵盤，否則方向鍵和 WASD 會被遊戲攔截，編輯器打不了字 */
  private setBusy(busy: boolean) {
    this.busy = busy;
    const kb = this.input.keyboard!;
    kb.enabled = !busy;
    if (busy) kb.disableGlobalCapture();
    else kb.enableGlobalCapture();
    kb.resetKeys();
    this.prompt.setVisible(false);
  }
}

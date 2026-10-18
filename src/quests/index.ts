import type { Quest } from "./types";
import { vendingMachine } from "./vendingMachine";

/** 新增關卡時，在這裡登記 */
export const quests: Record<string, Quest> = {
  [vendingMachine.id]: vendingMachine,
};

/**
==========================================================
AURA Trade OS
Bot State Manager
Version : 0.0.1 Alpha
==========================================================
*/

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/services/firebase";

import { FIRESTORE } from "./constants";

export interface BotPosition {

  pair: string;

  side: "BUY" | "SELL";

  entryPrice: number;

  quantity: number;

  amountIdr: number;

  openedAt: string;

}

export interface BotState {

  version: string;

  mode: string;

  lastRun: string;

  lastSignal: "BUY" | "SELL" | "HOLD";

  inPosition: boolean;

  position: BotPosition | null;

  dailyTrades: number;

  dailyProfit: number;

  dailyLoss: number;

}

const DEFAULT_STATE: BotState = {

  version: "0.0.1",

  mode: "paper",

  lastRun: "",

  lastSignal: "HOLD",

  inPosition: false,

  position: null,

  dailyTrades: 0,

  dailyProfit: 0,

  dailyLoss: 0,

};

const DOCUMENT_ID = "current";

export async function loadBotState(): Promise<BotState> {

  try {

    const ref = doc(
      db,
      FIRESTORE.BOT_STATE,
      DOCUMENT_ID
    );

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

      return DEFAULT_STATE;

    }

    return snapshot.data() as BotState;

  } catch (error) {

    console.error(
      "[STATE] Load Failed",
      error
    );

    return DEFAULT_STATE;

  }

}

export async function saveBotState(
  state: BotState
): Promise<void> {

  const ref = doc(
    db,
    FIRESTORE.BOT_STATE,
    DOCUMENT_ID
  );

  await setDoc(
    ref,
    {
      ...state,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

}

export async function resetBotState() {

  await saveBotState(DEFAULT_STATE);

}

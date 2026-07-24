import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface BotState {
  pair: string;
  inPosition: boolean;
  buyPrice: number;
  coinAmount: number;
  lastUpdated: string;
}

const STATE_COLLECTION = 'bot_state';

/**
 * Mengambil status posisi terkini bot dari Firestore
 */
export async function getBotState(pair: string = 'btc_idr'): Promise<BotState> {
  const defaultState: BotState = {
    pair,
    inPosition: false,
    buyPrice: 0,
    coinAmount: 0,
    lastUpdated: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, STATE_COLLECTION, pair);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as BotState;
    } else {
      // Buat dokumen state awal jika belum ada
      await setDoc(docRef, defaultState);
      return defaultState;
    }
  } catch (error) {
    console.error('[Firebase BotState Get Error]:', error);
    return defaultState;
  }
}

/**
 * Memperbarui status posisi bot di Firestore setelah eksekusi order
 */
export async function updateBotState(state: Partial<BotState> & { pair: string }): Promise<boolean> {
  try {
    const docRef = doc(db, STATE_COLLECTION, state.pair);
    const payload = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase BotState Update Error]:', error);
    return false;
  }
}

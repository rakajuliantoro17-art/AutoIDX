import { db } from './config';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface TradeLog {
  id?: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  totalIdr: number;
  reason: string;
  timestamp: string;
}

export interface ActivityLog {
  id?: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

const TRADES_COLLECTION = 'trades';
const LOGS_COLLECTION = 'activity_logs';

/**
 * Mencatat transaksi Jual/Beli yang telah dieksekusi oleh bot
 */
export async function recordTrade(trade: Omit<TradeLog, 'timestamp'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, TRADES_COLLECTION), {
      ...trade,
      timestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[Firebase Record Trade Error]:', error);
    return null;
  }
}

/**
 * Mencatat aktivitas eksekusi Cron/Engine
 */
export async function recordLog(type: ActivityLog['type'], message: string): Promise<void> {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      type,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Firebase Record Log Error]:', error);
  }
}

/**
 * Mengambil N riwayat aktivitas terakhir untuk ditampilkan di Dashboard UI
 */
export async function getRecentLogs(maxLogs: number = 10): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxLogs)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ActivityLog, 'id'>),
    }));
  } catch (error) {
    console.error('[Firebase Get Logs Error]:', error);
    return [];
  }
}
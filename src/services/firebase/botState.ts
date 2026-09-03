/**
==========================================================
AURA Trade OS
Firebase Bot State Manager (Admin SDK, server-only)
Version : 0.0.2 Alpha
==========================================================
CATATAN PENTING: file ini sebelumnya pakai Client SDK
("firebase/firestore"), yang di-block Firestore Security
Rules saat dipanggil dari server (request.auth selalu null
di context ini) -- sama persis masalah yang sudah pernah
diperbaiki di paperTradingStore.ts. Query/write gagal diam-
diam, masuk catch, balik ke default state -- artinya
tracking posisi (inPosition dkk) kelihatan terpasang tapi
berisiko tidak pernah benar-benar tersimpan/terbaca dari
Firestore. Sudah diperbaiki pakai Admin SDK. Dicek dulu
(sebelum diubah): semua pemakai file ini ada di
services/trading/* dan dipanggil dari cron (server-only),
TIDAK ada komponen client yang mengimpor file ini -- jadi
aman pakai Admin SDK di sini.
==========================================================
*/


import { adminDb } from "@/services/firebase/admin";

import { FieldValue } from "firebase-admin/firestore";




export interface BotState {


pair:string;



status:

"IDLE"

|

"BUY"

|

"SELL";



inPosition:boolean;



entryPrice:number;



currentPrice:number;



coinAmount:number;



positionValue:number;



profitPercent:number;



stopLoss:number;



takeProfit:number;



/**
 * Level HARGA ABSOLUT stop-loss/take-profit, dihitung SEKALI
 * dari ATR saat BUY (lihat services/trading/risk.ts,
 * calculateAtrStopLevels) dan disimpan di sini -- BUKAN
 * dihitung ulang dari persentase statis tiap siklus. 0 berarti
 * belum diset (posisi lama dari sebelum ATR SL/TP dipasang,
 * atau memang sedang tidak posisi) -- risk.ts fallback ke
 * RISK_CONFIG persentase statis kalau nilainya 0.
 */

stopLossPrice:number;



takeProfitPrice:number;



lastSignal:

"BUY"

|

"SELL"

|

"HOLD";



/**
 * Nama strategi yang menghasilkan sinyal BUY saat posisi ini
 * dibuka (mis. "AURA_TREND") -- disimpan supaya SELL/stop-loss/
 * take-profit paksa di siklus BERIKUTNYA (bisa jauh setelah BUY,
 * strategyManager.evaluate() sudah lanjut ke sinyal terbaru) bisa
 * tetap tahu strategi ASAL posisi ini dibuka, bukan strategi yang
 * kebetulan aktif saat SELL terjadi. Optional -- posisi lama dari
 * sebelum field ini ada tidak akan punya nilai ini tersimpan.
 */
strategyAtEntry?:string;



lastOrderId?:string;



lastTradeAt?:number;



updatedAt:any;



}




const STATE_COLLECTION="bot_state";




function defaultState(pair:string):BotState{


return {

pair,

status:"IDLE",

inPosition:false,

entryPrice:0,

currentPrice:0,

coinAmount:0,

positionValue:0,

profitPercent:0,

stopLoss:1,


takeProfit:3,


stopLossPrice:0,


takeProfitPrice:0,


lastSignal:"HOLD",


updatedAt:new Date()

};

}




export async function getBotState(

pair="btc_idr"

):Promise<BotState>{



const fallback=

defaultState(pair);



try{



const ref=

adminDb

.collection(STATE_COLLECTION)

.doc(pair);



const snapshot=

await ref.get();




if(snapshot.exists){


return {


...fallback,


...snapshot.data()

} as BotState;


}




await ref.set(

fallback

);



return fallback;



}

catch(error){


console.error(

"[BOT STATE GET ERROR]",

error

);



return fallback;


}



}




export async function updateBotState(

state:

Partial<BotState>

&

{

pair:string}

):Promise<boolean>{




if(!state.pair){


return false;


}







try{



const ref=

adminDb

.collection(STATE_COLLECTION)

.doc(state.pair);




await ref.set(

{

...state,


updatedAt:

FieldValue.serverTimestamp()


},


{

merge:true

}



);



return true;



}

catch(error){


console.error(

"[BOT STATE UPDATE ERROR]",

error

);



return false;


}



}


/**
 * Hitung jumlah posisi terbuka di SEMUA pair
 * (bukan cuma satu pair) -- dipakai untuk validasi
 * RISK_CONFIG.maxOpenPosition sebelum BUY baru.
 */
export async function getOpenPositionsCount(): Promise<number> {

  try {

    const snapshot = await adminDb
      .collection(STATE_COLLECTION)
      .where("inPosition", "==", true)
      .get();

    return snapshot.size;

  } catch (error) {

    console.error(
      "[BOT STATE OPEN POSITIONS ERROR]",
      error
    );

    // Fail-safe: kalau query gagal, anggap sudah penuh
    // supaya tidak membuka posisi baru secara membabi buta.
    return Number.MAX_SAFE_INTEGER;

  }

}

/**
 * Daftar pair yang SAAT INI sedang punya posisi terbuka.
 *
 * Dipakai scheduler (cron) supaya pair yang lagi dipegang tetap
 * diproses setiap siklus -- untuk cek stop-loss/take-profit/SELL --
 * walaupun pair itu sudah tidak lagi masuk daftar top opportunities
 * hasil scan market siklus berikutnya. Tanpa ini, posisi bisa
 * "nyangkut" tidak pernah dicek lagi kalau scanner sudah pindah
 * fokus ke pair lain.
 */
export async function getOpenPositionPairs(): Promise<string[]> {

  try {

    const snapshot = await adminDb
      .collection(STATE_COLLECTION)
      .where("inPosition", "==", true)
      .get();

    return snapshot.docs.map((doc) => doc.id);

  } catch (error) {

    console.error(
      "[BOT STATE OPEN POSITION PAIRS ERROR]",
      error
    );

    // Fail-safe: kalau query gagal, kembalikan array kosong.
    // (Beda dengan getOpenPositionsCount yang fail-safe ke angka
    // besar -- di sini kita tidak tahu PAIR mana yang open, jadi
    // tidak ada yang aman untuk "ditebak".)
    return [];

  }

}

/**
 * Daftar SEMUA pair yang punya bot_state tersimpan (pernah
 * disentuh bot minimal 1 siklus, TERLEPAS posisinya sedang
 * terbuka atau tidak) -- dipakai dashboard untuk mengisi
 * pilihan pair yang bisa ditampilkan (Overview sebelumnya
 * hardcode "btc_idr" saja, padahal bot sudah scan & bisa BUY
 * pair manapun lewat scanner/index.ts).
 */
export async function getAllTrackedPairs(): Promise<string[]> {

  try {

    const snapshot = await adminDb
      .collection(STATE_COLLECTION)
      .get();

    return snapshot.docs.map((doc) => doc.id);

  } catch (error) {

    console.error(
      "[BOT STATE ALL TRACKED PAIRS ERROR]",
      error
    );

    // Fail-safe: array kosong -- pemanggil (dashboard) sudah
    // punya fallback daftar pair statis untuk kasus ini.
    return [];

  }

}

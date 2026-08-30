/**
==========================================================
AURA Trade OS
Firebase Logging Service
Version : 0.0.2 Alpha
(Diperbaiki: pakai Admin SDK, bukan client SDK, karena file ini
dipanggil dari server/API route yang tidak punya Firebase Auth
context. Client SDK di server selalu kena block Firestore
Security Rules karena request.auth selalu null.)
==========================================================
*/

import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

export interface TradeLog {

id?:string;

pair:string;

type:

"BUY"

|

"SELL";

price:number;

amount:number;

totalIdr:number;

fee?:number;

orderId?:string;

strategySignal?:

"BUY"

|

"SELL"

|

"HOLD";

aiConfidence?:number;

reason:string;

/**
 * Nama strategi yang bertanggung jawab atas trade ini (untuk
 * atribusi profit->strategi, strategyAnalytics.ts). Opsional -
 * trade lama sebelum field ini ada tidak akan punya nilai ini.
 */
strategy?:string;

mode:

"paper"

|

"live";

timestamp?:any;

}

export interface ActivityLog {

id?:string;

source:

"BOT"

|

"AI"

|

"RISK"

|

"SYSTEM"

|

"API";

type:

"info"

|

"success"

|

"warning"

|

"danger";

message:string;

timestamp?:any;

}

const TRADES_COLLECTION="trades";

const LOGS_COLLECTION="activity_logs";

/**
 * Record executed trade
 */

export async function recordTrade(

trade:Omit<TradeLog,"timestamp">

):Promise<string|null>{

try{

const ref=

await adminDb.collection(TRADES_COLLECTION).add(

{

...trade,

timestamp:

FieldValue.serverTimestamp()

}

);

return ref.id;

}

catch(error){

console.error(

"[TRADE LOG ERROR]",

error

);

return null;

}

}

/**
 * Record bot activity
 */

/**
 * FIX (timeout cron konsisten ~30s): recordLog() dipanggil di 93
 * tempat di seluruh codebase, MINIMAL 3-4x per pair per siklus
 * cron (cron start, hasil trading engine, confidence info, plus
 * lebih banyak lagi kalau sinyalnya BUY -- sanity check 1, sanity
 * check 2, config clamp, SL/TP, dst di engine.ts). SEBELUMNYA
 * setiap panggilan di-`await` PENUH sampai Firestore write
 * selesai -- dengan PAIR_CONCURRENCY=5 tapi tiap pair sendiri
 * memproses SEKUENSIAL (bukan cuma network call, tapi banyak
 * `await recordLog` berantai), ini kemungkinan kontributor besar
 * ke total durasi, di luar 2 bug lain yang sudah diperbaiki
 * (logAIAdvisory fire-and-forget, aiCalibration batched).
 *
 * Sekarang write ke Firestore TIDAK di-await di dalam sini --
 * cuma "ditembak" (fire-and-forget) dan errornya ditangani lewat
 * .catch() terpisah. Fungsi ini TETAP `async`/return Promise<void>
 * supaya SEMUA 93 titik pakai `await recordLog(...)` yang sudah
 * ada TETAP VALID (await atas promise yang sudah resolve itu
 * instan, tidak error) -- TIDAK PERLU mengubah satu pun dari 93
 * tempat itu.
 *
 * Trade-off yang SADAR diambil (sama seperti automationNotifier
 * & logAIAdvisory yang lebih dulu diperbaiki dengan pola ini):
 * kalau function keburu dibekukan/selesai SEBELUM write ini
 * benar-benar sampai ke Firestore, log itu bisa hilang. Ini
 * DITERIMA -- kehilangan satu baris log activity jauh lebih murah
 * daripada SELURUH siklus scan+trading timeout (yang berarti
 * stop-loss/take-profit juga tidak sempat dicek sama sekali).
 */
export async function recordLog(

source:ActivityLog["source"],

type:ActivityLog["type"],

message:string

):Promise<void>{

adminDb.collection(LOGS_COLLECTION).add(

{

source,

type,

message,

timestamp:

FieldValue.serverTimestamp()

}

).catch((error) => {

console.error(

"[ACTIVITY LOG ERROR]",

error

);

});

}

/**
 * Get latest logs
 */

export async function getRecentLogs(

maxLogs=20

):Promise<ActivityLog[]>{

try{

const snapshot=

await adminDb

.collection(LOGS_COLLECTION)

.orderBy("timestamp","desc")

.limit(maxLogs)

.get();

return snapshot.docs.map(doc=>(

{

id:doc.id,

...(doc.data() as Omit<ActivityLog,"id">)

}

));

}

catch(error){

console.error(

"[GET LOG ERROR]",

error

);

return [];

}

}

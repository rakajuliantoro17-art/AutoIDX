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

export async function recordLog(

source:ActivityLog["source"],

type:ActivityLog["type"],

message:string

):Promise<void>{

try{

await adminDb.collection(LOGS_COLLECTION).add(

{

source,

type,

message,

timestamp:

FieldValue.serverTimestamp()

}

);

}

catch(error){

console.error(

"[ACTIVITY LOG ERROR]",

error

);

}

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

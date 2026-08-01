/**
==========================================================
AURA Trade OS
Firebase Bot State Manager
Version : 0.0.2 Alpha
(Diperbaiki: pakai Admin SDK, bukan client SDK, karena file ini
dipanggil dari server/API route yang tidak punya Firebase Auth
context. Client SDK di server selalu kena block Firestore
Security Rules karena request.auth selalu null.)
==========================================================
*/

import { adminDb } from "./admin";
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

lastSignal:

"BUY"

|

"SELL"

|

"HOLD";

lastOrderId?:string;

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

adminDb.collection(STATE_COLLECTION).doc(pair);

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

adminDb.collection(STATE_COLLECTION).doc(state.pair);

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

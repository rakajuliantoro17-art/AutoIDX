/**
==========================================================
AURA Trade OS
Firebase Logging Service
Version : 0.0.1 Alpha
==========================================================
*/


import {

db

}

from "./config";


import {

collection,

addDoc,

query,

orderBy,

limit,

getDocs,

serverTimestamp

}

from "firebase/firestore";







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

await addDoc(

collection(

db,

TRADES_COLLECTION

),


{


...trade,


timestamp:

serverTimestamp()



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


await addDoc(

collection(

db,

LOGS_COLLECTION

),


{


source,

type,

message,


timestamp:

serverTimestamp()



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


const q=

query(

collection(

db,

LOGS_COLLECTION

),


orderBy(

"timestamp",

"desc"

),


limit(maxLogs)

);






const snapshot=

await getDocs(q);






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

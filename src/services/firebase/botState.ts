/**
==========================================================
AURA Trade OS
Firebase Bot State Manager
Version : 0.0.1 Alpha
==========================================================
*/


import {

doc,

getDoc,

setDoc,

serverTimestamp

}

from "firebase/firestore";


import {

db

}

from "./config";







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

doc(

db,

STATE_COLLECTION,

pair

);



const snapshot=

await getDoc(ref);






if(snapshot.exists()){


return {


...fallback,


...snapshot.data()

} as BotState;


}






await setDoc(

ref,

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

doc(

db,

STATE_COLLECTION,

state.pair

);





await setDoc(

ref,

{

...state,


updatedAt:

serverTimestamp()



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

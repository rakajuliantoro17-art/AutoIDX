/**
==========================================================
AURA Trade OS
AI Client Service
Version : 0.0.1 Alpha
==========================================================
*/


interface AIResponse {

success:boolean;

content:string|null;

provider:string;

}





export async function queryAIModel(

prompt:string

):Promise<AIResponse>{



const openAIKey=

process.env.OPENAI_API_KEY;



const geminiKey=

process.env.GEMINI_API_KEY;





if(!openAIKey && !geminiKey){


console.warn(

"[AI] No API Key configured"

);


return {

success:false,

content:null,

provider:"none"

};


}






try{


/*
=====================================
OpenAI Provider
=====================================
*/


if(openAIKey){



const response=

await fetch(

"https://api.openai.com/v1/chat/completions",

{

method:"POST",

headers:{


"Content-Type":

"application/json",


Authorization:

`Bearer ${openAIKey}`


},


body:JSON.stringify({


model:"gpt-4o-mini",


messages:[

{

role:"system",

content:

"You are a crypto market analysis assistant. Never execute trades."

},

{

role:"user",

content:prompt

}

],


temperature:0.2


})


}

);






if(!response.ok){

throw new Error(

`OpenAI Error ${response.status}`

);

}





const data=

await response.json();




return {


success:true,


provider:"openai",


content:

data.choices?.[0]

?.message

?.content

??

null


};



}






/*
=====================================
Gemini Provider
=====================================
*/


if(geminiKey){



const response=

await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,

{


method:"POST",

headers:{


"Content-Type":

"application/json"


},


body:JSON.stringify({


contents:[

{

parts:[

{

text:prompt

}

]

}

]


})


}

);






const data=

await response.json();




return {


success:true,


provider:"gemini",


content:

data.candidates?.[0]

?.content

?.parts?.[0]

?.text

??

null


};



}





return {


success:false,

content:null,

provider:"unknown"


};



}

catch(error){


console.error(

"[AI Service Error]",

error

);



return {


success:false,


content:null,


provider:"error"


};



}



}

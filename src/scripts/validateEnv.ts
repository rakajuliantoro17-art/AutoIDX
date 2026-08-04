```typescript
/**
==========================================================
AURA Trade OS
Environment Validator
Version : 0.1.0 Alpha
==========================================================
Validate Required Environment Variables
==========================================================
*/

type EnvironmentVariable = {

    name: string;

    required: boolean;

    description: string;

};





/*
==========================================================
Environment Variables
==========================================================
*/

const VARIABLES: EnvironmentVariable[] = [

    /*
    ======================================================
    Firebase
    ======================================================
    */

    {

        name: "NEXT_PUBLIC_FIREBASE_API_KEY",

        required: true,

        description: "Firebase API Key",

    },

    {

        name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",

        required: true,

        description: "Firebase Auth Domain",

    },

    {

        name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",

        required: true,

        description: "Firebase Project",

    },

    {

        name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",

        required: true,

        description: "Firebase Storage",

    },

    {

        name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",

        required: true,

        description: "Firebase Messaging",

    },

    {

        name: "NEXT_PUBLIC_FIREBASE_APP_ID",

        required: true,

        description: "Firebase App",

    },

    {

        name: "FIREBASE_CLIENT_EMAIL",

        required: true,

        description: "Firebase Service Account",

    },

    {

        name: "FIREBASE_PRIVATE_KEY",

        required: true,

        description: "Firebase Private Key",

    },





    /*
    ======================================================
    Indodax
    ======================================================
    */

    {

        name: "INDODAX_API_KEY",

        required: true,

        description: "Indodax API",

    },

    {

        name: "INDODAX_SECRET_KEY",

        required: true,

        description: "Indodax Secret",

    },





    /*
    ======================================================
    Scheduler
    ======================================================
    */

    {

        name: "CRON_SECRET",

        required: true,

        description: "Cron Authentication",

    },





    /*
    ======================================================
    Optional
    ======================================================
    */

    {

        name: "OPENAI_API_KEY",

        required: false,

        description: "OpenAI",

    },

    {

        name: "GEMINI_API_KEY",

        required: false,

        description: "Google Gemini",

    },

    {

        name: "TELEGRAM_BOT_TOKEN",

        required: false,

        description: "Telegram",

    },

    {

        name: "TELEGRAM_CHAT_ID",

        required: false,

        description: "Telegram Chat",

    },

];





/*
==========================================================
Validation
==========================================================
*/

let errors = 0;

let warnings = 0;

console.log("\n========================================");

console.log("AURA Environment Validation");

console.log("========================================\n");

for (const variable of VARIABLES) {

    const value = process.env[variable.name];

    if (!value || value.trim() === "") {

        if (variable.required) {

            console.error(

                `✖ ${variable.name} (Required)`

            );

            errors++;

        } else {

            console.warn(

                `⚠ ${variable.name} (Optional)`

            );

            warnings++;

        }

    } else {

        console.log(

            `✔ ${variable.name}`

        );

    }

}





/*
==========================================================
Summary
==========================================================
*/

console.log("\n----------------------------------------");

console.log(`Required Errors : ${errors}`);

console.log(`Optional Missing: ${warnings}`);

console.log("----------------------------------------");





/*
==========================================================
Result
==========================================================
*/

if (errors > 0) {

    console.error(

        "\nEnvironment validation FAILED."

    );

    process.exit(1);

}

console.log(

    "\nEnvironment validation PASSED."

);

process.exit(0);
```


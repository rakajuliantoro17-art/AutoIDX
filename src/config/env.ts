/**
==========================================================
AURA Trade OS
Environment Configuration
Version : 0.1.0 Alpha
==========================================================
Centralized Environment Variables
==========================================================
*/


/*
==========================================================
Helper
==========================================================
*/

function required(name: string): string {

    const value = process.env[name];

    if (!value || value.trim() === "") {

        throw new Error(
            `[ENV] Missing required environment variable: ${name}`
        );

    }

    return value;

}

function optional(
    name: string,
    defaultValue = ""
): string {

    return process.env[name] ?? defaultValue;

}

function optionalNumber(
    name: string,
    defaultValue: number
): number {

    const value = process.env[name];

    if (!value) {

        return defaultValue;

    }

    const parsed = Number(value);

    return Number.isNaN(parsed)
        ? defaultValue
        : parsed;

}

function optionalBoolean(
    name: string,
    defaultValue = false
): boolean {

    const value = process.env[name];

    if (!value) {

        return defaultValue;

    }

    return value === "true";

}





/*
==========================================================
Application
==========================================================
*/

export const env = {

    app: {

        name: optional(
            "NEXT_PUBLIC_APP_NAME",
            "AURA Trade OS"
        ),

        version: optional(
            "NEXT_PUBLIC_APP_VERSION",
            "0.1.0 Alpha"
        ),

    },





    /*
    ==========================================================
    Firebase
    ==========================================================
    */

    firebase: {

        apiKey: required(
            "NEXT_PUBLIC_FIREBASE_API_KEY"
        ),

        authDomain: required(
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        ),

        projectId: required(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        ),

        storageBucket: required(
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        ),

        messagingSenderId: required(
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        ),

        appId: required(
            "NEXT_PUBLIC_FIREBASE_APP_ID"
        ),

        clientEmail: required(
            "FIREBASE_CLIENT_EMAIL"
        ),

        privateKey: required(
            "FIREBASE_PRIVATE_KEY"
        ).replace(/\\n/g, "\n"),

    },





    /*
    ==========================================================
    Indodax
    ==========================================================
    */

    indodax: {

        apiKey: required(
            "INDODAX_API_KEY"
        ),

        secretKey: required(
            "INDODAX_SECRET_KEY"
        ),

    },





    /*
    ==========================================================
    Trading
    ==========================================================
    */

    trading: {

        pair: optional(
            "DEFAULT_PAIR",
            "btc_idr"
        ),

        timeframe: optional(
            "DEFAULT_TIMEFRAME",
            "1m"
        ),

        feePercent: optionalNumber(
            "FEE_PERCENT",
            0.003
        ),

        slippagePercent: optionalNumber(
            "SLIPPAGE_PERCENT",
            0.001
        ),

        maxExposure: optionalNumber(
            "MAX_EXPOSURE_PERCENT",
            50
        ),

        maxPosition: optionalNumber(
            "MAX_POSITION_PERCENT",
            20
        ),

        minimumConfidence: optionalNumber(
            "MIN_CONFIDENCE",
            70
        ),

    },





    /*
    ==========================================================
    Scheduler
    ==========================================================
    */

    scheduler: {

        cronSecret: required(
            "CRON_SECRET"
        ),

        scanInterval: optionalNumber(
            "SCAN_INTERVAL",
            60
        ),

    },





    /*
    ==========================================================
    AI
    ==========================================================
    */

    ai: {

        openaiKey: optional(
            "OPENAI_API_KEY"
        ),

        geminiKey: optional(
            "GEMINI_API_KEY"
        ),

    },





    /*
    ==========================================================
    Telegram
    ==========================================================
    */

    telegram: {

        token: optional(
            "TELEGRAM_BOT_TOKEN"
        ),

        chatId: optional(
            "TELEGRAM_CHAT_ID"
        ),

    },





    /*
    ==========================================================
    Logging
    ==========================================================
    */

    logging: {

        level: optional(
            "LOG_LEVEL",
            "info"
        ),

    },





    /*
    ==========================================================
    Runtime
    ==========================================================
    */

    runtime: {

        nodeEnv: optional(
            "NODE_ENV",
            "development"
        ),

        isDevelopment:

            process.env.NODE_ENV ===
            "development",

        isProduction:

            process.env.NODE_ENV ===
            "production",

        isPreview:

            process.env.VERCEL_ENV ===
            "preview",

    },





    /*
    ==========================================================
    Feature Flags
    ==========================================================
    */

    features: {

        aiEnabled:

            optionalBoolean(
                "FEATURE_AI",
                false
            ),

        paperTrading:

            optionalBoolean(
                "FEATURE_PAPER_TRADING",
                true
            ),

        liveTrading:

            optionalBoolean(
                "FEATURE_LIVE_TRADING",
                false
            ),

    },

};

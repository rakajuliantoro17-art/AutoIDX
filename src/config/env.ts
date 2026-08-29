/**
==========================================================
AURA Trade OS
Environment Configuration
Version : 0.2.0 Alpha
==========================================================
Centralized Environment Variables

Perubahan dari 0.1.0:
1. indodax.apiKey/secretKey SEBELUMNYA pakai required() --
   ini BAHAYA karena merepresentasikan pola kredensial GLOBAL
   TUNGGAL yang sudah DITINGGALKAN (lihat services/liveTrading/
   exchange/account.ts & createIndodaxExchangeClient.ts).
   Sistem sekarang pakai multi-akun Firestore per-user
   (services/firebase/indodaxAccountsAdmin.ts, dipakai
   trading/live.ts) -- INDODAX_API_KEY/SECRET_KEY global TIDAK
   WAJIB lagi. Kalau required() dibiarkan dan file ini
   diimport dari jalur yang reachable tanpa env var itu di-set,
   SELURUH APP CRASH saat cold-start untuk sesuatu yang
   sebenarnya tidak wajib. Diubah ke optional() -- cuma
   fallback/legacy compat (dipakai IndodaxClient kalau tidak
   ada credentials eksplisit disuntikkan), BUKAN sumber utama.
2. ai.* ditambah claudeKey & deepseekKey -- sebelumnya cuma
   openaiKey/geminiKey padahal AI advisory di trading/engine.ts
   (confirmBuyWithAI/logAIAdvisory) sudah dukung 4 provider
   (OpenAI/Gemini/Claude/DeepSeek, auto-detect dari env var
   yang ada).
3. features.mlEnabled ditambah -- placeholder flag untuk
   pengembangan ML ke depan (belum ada implementasi ML
   sungguhan di project ini per audit sesi ini), pola sama
   dengan aiEnabled/paperTrading/liveTrading yang sudah ada.
4. FIX BUG KRITIS (audit sesi berikutnya): firebase.clientEmail/
   privateKey SEBELUMNYA pakai required("FIREBASE_CLIENT_EMAIL")/
   required("FIREBASE_PRIVATE_KEY") - env var itu TIDAK PERNAH
   ADA di project ini. Nama yang benar-benar dipakai
   services/firebase/admin.ts: FIREBASE_ADMIN_CLIENT_EMAIL,
   FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_PROJECT_ID (field
   terakhir bahkan belum ada di sini sebelumnya, ditambahkan
   sekarang). Kalau file ini pernah di-import dari jalur reachable
   manapun sebelum fix ini, app akan SELALU crash saat cold-start.

CATATAN PENTING: file ini SENGAJA belum di-wire ke
trading/engine.ts (hot path yang dipanggil tiap siklus cron).
engine.ts & cron.ts saat ini baca process.env langsung
(tersebar, bukan lewat file ini) -- itu genuinely bukan bug,
cuma belum dikonsolidasi. required() untuk Firebase config &
CRON_SECRET di file ini artinya kalau ada YANG BELUM di-set
saat engine.ts/cron.ts jalan, import file ini akan throw di
tengah siklus trading -- risiko baru yang tidak ada sekarang
(engine.ts saat ini graceful: masing-masing service yang
butuh Firebase/dsb sudah py handling sendiri). Konsolidasi ke
sini sebaiknya dilakukan bertahap & diuji terpisah dulu, bukan
langsung ke hot path uang asli.
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

        // FIX (audit sesi ini): SEBELUMNYA pakai required("FIREBASE_
        // CLIENT_EMAIL")/required("FIREBASE_PRIVATE_KEY") - env var
        // itu TIDAK PERNAH ADA di project ini (cek
        // services/firebase/admin.ts, sumber kebenaran yang genuinely
        // dipakai). Nama yang benar: FIREBASE_ADMIN_CLIENT_EMAIL,
        // FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_PROJECT_ID (yang
        // terakhir bahkan belum ada field-nya sama sekali di sini,
        // ditambahkan sekarang). Kalau file ini SEBELUMNYA sempat
        // di-import dari jalur reachable manapun, app akan SELALU
        // crash saat cold-start karena required() gagal menemukan
        // env var yang memang tidak pernah di-set siapapun.
        adminProjectId: required(
            "FIREBASE_ADMIN_PROJECT_ID"
        ),

        clientEmail: required(
            "FIREBASE_ADMIN_CLIENT_EMAIL"
        ),

        privateKey: required(
            "FIREBASE_ADMIN_PRIVATE_KEY"
        ).replace(/\\n/g, "\n"),

    },





    /*
    ==========================================================
    Indodax

    optional() dengan sengaja -- BUKAN required(). Ini kredensial
    GLOBAL TUNGGAL, pola LAMA yang sudah digantikan sistem
    multi-akun Firestore (lihat catatan lengkap di header file
    ini). Cuma dipakai sebagai fallback oleh IndodaxClient kalau
    tidak ada credentials eksplisit disuntikkan -- jalur live
    trading yang aktif (trading/live.ts) TIDAK bergantung ke
    field ini sama sekali, selalu suntik credentials dari akun
    aktif Firestore.
    ==========================================================
    */

    indodax: {

        apiKey: optional(
            "INDODAX_API_KEY"
        ),

        secretKey: optional(
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

    /*
    ==========================================================
    AI

    4 provider -- selaras dengan AI_PROVIDER_CANDIDATES di
    trading/engine.ts (confirmBuyWithAI/logAIAdvisory), yang
    auto-detect provider mana yang API key-nya ada di env,
    urutan OpenAI -> Gemini -> Claude -> DeepSeek.
    ==========================================================
    */

    ai: {

        openaiKey: optional(
            "OPENAI_API_KEY"
        ),

        geminiKey: optional(
            "GEMINI_API_KEY"
        ),

        claudeKey: optional(
            "CLAUDE_API_KEY"
        ),

        deepseekKey: optional(
            "DEEPSEEK_API_KEY"
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

        /**
         * services/ml/ (index.ts, pipeline.ts, manager.ts, types.ts)
         * SUDAH ADA dan sebagian tersambung ke dashboard/ml-lab.tsx
         * (/api/ml/train, /api/ml/predict) -- BELUM diverifikasi
         * sesi ini seberapa lengkap/aktif implementasinya. Flag ini
         * disediakan sebagai titik kontrol on/off untuk fitur ML,
         * belum tentu semua jalur ML sudah membaca flag ini --
         * cek services/ml/ langsung sebelum mengandalkan flag ini
         * sebagai kill-switch yang genuinely efektif.
         */
        mlEnabled:

            optionalBoolean(
                "FEATURE_ML",
                false
            ),

    },

};

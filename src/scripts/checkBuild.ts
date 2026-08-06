/**
==========================================================
AURA Trade OS
Build Checker
Version : 0.1.0 Alpha
==========================================================
Pre-build Validation Script
==========================================================
*/

import fs from "node:fs";

import path from "node:path";

const ROOT = process.cwd();

let hasError = false;





/*
==========================================================
Helpers
==========================================================
*/

function checkFile(file: string): void {

    const target = path.join(ROOT, file);

    if (!fs.existsSync(target)) {

        console.error(`✖ Missing: ${file}`);

        hasError = true;

        return;

    }

    console.log(`✔ ${file}`);

}

function checkDirectory(directory: string): void {

    const target = path.join(ROOT, directory);

    if (!fs.existsSync(target)) {

        console.error(`✖ Missing directory: ${directory}`);

        hasError = true;

        return;

    }

    console.log(`✔ ${directory}`);

}





/*
==========================================================
Project Structure
==========================================================
*/

console.log("\nChecking project structure...\n");

checkFile("package.json");

checkFile("tsconfig.json");

checkFile("next.config.js");

checkDirectory("src");

checkDirectory("src/services");

checkDirectory("src/config");

checkDirectory("src/errors");

checkDirectory("docs");





/*
==========================================================
Critical Files
==========================================================
*/

console.log("\nChecking critical files...\n");

checkFile("src/config/env.ts");

checkFile("src/config/constants.ts");

checkFile("src/config/limits.ts");

checkFile("src/errors/index.ts");





/*
==========================================================
Environment Variables
==========================================================
*/

console.log("\nChecking environment...\n");

const requiredEnv = [

    "INDODAX_API_KEY",

    "INDODAX_SECRET_KEY",

    "NEXT_PUBLIC_FIREBASE_API_KEY",

    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",

];

for (const env of requiredEnv) {

    if (!process.env[env]) {

        console.warn(`⚠ Missing ENV: ${env}`);

    } else {

        console.log(`✔ ${env}`);

    }

}





/*
==========================================================
Build Result
==========================================================
*/

console.log("\n====================================");

if (hasError) {

    console.error("BUILD CHECK FAILED");

    process.exit(1);

}

console.log("BUILD CHECK PASSED");

console.log("====================================");

process.exit(0);


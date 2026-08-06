/**
==========================================================
AURA Trade OS
Diagnostic Service
Version : 0.1.0 Alpha
==========================================================
System Diagnostic
==========================================================
*/

import { env } from "@/config/env";



/*
==========================================================
Types
==========================================================
*/

export type DiagnosticStatus =

    | "PASS"

    | "WARNING"

    | "FAIL";



export interface DiagnosticItem {

    name: string;

    status: DiagnosticStatus;

    message: string;

    timestamp: number;

}



export interface DiagnosticReport {

    success: boolean;

    generatedAt: number;

    items: DiagnosticItem[];

}





/*
==========================================================
Diagnostic Service
==========================================================
*/

export class DiagnosticService {

    private readonly items: DiagnosticItem[] = [];



    /*
    ======================================================
    Add Result
    ======================================================
    */

    private add(

        name: string,

        status: DiagnosticStatus,

        message: string,

    ): void {

        this.items.push({

            name,

            status,

            message,

            timestamp: Date.now(),

        });

    }





    /*
    ======================================================
    Environment
    ======================================================
    */

    public checkEnvironment(): void {

        try {

            if (

                env.indodax.apiKey &&

                env.indodax.secretKey

            ) {

                this.add(

                    "Environment",

                    "PASS",

                    "Environment variables loaded."

                );

            }

        }

        catch {

            this.add(

                "Environment",

                "FAIL",

                "Environment configuration invalid."

            );

        }

    }





    /*
    ======================================================
    Firebase
    ======================================================
    */

    public checkFirebase(): void {

        if (

            env.firebase.projectId &&

            env.firebase.apiKey

        ) {

            this.add(

                "Firebase",

                "PASS",

                "Firebase configuration detected."

            );

        }

        else {

            this.add(

                "Firebase",

                "FAIL",

                "Firebase configuration missing."

            );

        }

    }





    /*
    ======================================================
    Indodax
    ======================================================
    */

    public checkExchange(): void {

        if (

            env.indodax.apiKey &&

            env.indodax.secretKey

        ) {

            this.add(

                "Indodax",

                "PASS",

                "Exchange credentials detected."

            );

        }

        else {

            this.add(

                "Indodax",

                "FAIL",

                "Exchange credentials missing."

            );

        }

    }





    /*
    ======================================================
    AI
    ======================================================
    */

    public checkAI(): void {

        if (

            env.ai.openaiKey ||

            env.ai.geminiKey

        ) {

            this.add(

                "AI",

                "PASS",

                "AI provider configured."

            );

        }

        else {

            this.add(

                "AI",

                "WARNING",

                "No AI provider configured."

            );

        }

    }





    /*
    ======================================================
    Live Trading
    ======================================================
    */

    public checkLiveTrading(): void {

        if (

            env.features.liveTrading

        ) {

            this.add(

                "Live Trading",

                "PASS",

                "Live Trading enabled."

            );

        }

        else {

            this.add(

                "Live Trading",

                "WARNING",

                "Live Trading disabled."

            );

        }

    }





    /*
    ======================================================
    Paper Trading
    ======================================================
    */

    public checkPaperTrading(): void {

        if (

            env.features.paperTrading

        ) {

            this.add(

                "Paper Trading",

                "PASS",

                "Paper Trading enabled."

            );

        }

        else {

            this.add(

                "Paper Trading",

                "WARNING",

                "Paper Trading disabled."

            );

        }

    }





    /*
    ======================================================
    Run
    ======================================================
    */

    public run(): DiagnosticReport {

        this.items.length = 0;

        this.checkEnvironment();

        this.checkFirebase();

        this.checkExchange();

        this.checkAI();

        this.checkPaperTrading();

        this.checkLiveTrading();

        return {

            success:

                !this.items.some(

                    item => item.status === "FAIL"

                ),

            generatedAt: Date.now(),

            items: [...this.items],

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticService =

    new DiagnosticService();


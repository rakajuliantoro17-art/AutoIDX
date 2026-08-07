/**
==========================================================
AURA Trade OS
Profiler
Version : 0.3.0 Alpha
==========================================================
Application Performance Profiler
==========================================================
*/

import { performance } from "node:perf_hooks";





/*
==========================================================
Types
==========================================================
*/

export interface ProfileResult {

    operation: string;

    duration: number;

    startedAt: Date;

    finishedAt: Date;

}





/*
==========================================================
Profiler
==========================================================
*/

export class Profiler {

    /*
    ======================================================
    Profile
    ======================================================
    */

    public async profile<T>(

        operation: string,

        callback: () => Promise<T>,

    ): Promise<{

        result: T;

        profile: ProfileResult;

    }> {

        const startedAt =

            new Date();



        const start =

            performance.now();



        const result =

            await callback();



        const duration =

            performance.now() -

            start;



        const profile: ProfileResult = {

            operation,

            duration,

            startedAt,

            finishedAt:

                new Date(),

        };



        return {

            result,

            profile,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const profiler =

    new Profiler();

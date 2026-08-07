/**
==========================================================
AURA Trade OS
Profiler Report
Version : 0.3.0 Alpha
==========================================================
Profiler Report Builder
==========================================================
*/

import type {

    ProfileResult,

} from "./profiler";





/*
==========================================================
Types
==========================================================
*/

export interface ProfilerSummary {

    totalOperations: number;

    averageDuration: number;

    slowestOperation: ProfileResult | null;

    fastestOperation: ProfileResult | null;

}





/*
==========================================================
Profiler Report
==========================================================
*/

export class ProfilerReport {

    /*
    ======================================================
    Build
    ======================================================
    */

    public build(

        profiles: ProfileResult[],

    ): ProfilerSummary {

        if (

            profiles.length === 0

        ) {

            return {

                totalOperations: 0,

                averageDuration: 0,

                slowestOperation: null,

                fastestOperation: null,

            };

        }



        const total =

            profiles.reduce(

                (sum, profile) =>

                    sum +

                    profile.duration,

                0,

            );



        const slowest =

            profiles.reduce(

                (a, b) =>

                    a.duration >

                    b.duration

                        ? a

                        : b,

            );



        const fastest =

            profiles.reduce(

                (a, b) =>

                    a.duration <

                    b.duration

                        ? a

                        : b,

            );



        return {

            totalOperations:

                profiles.length,

            averageDuration:

                total /

                profiles.length,

            slowestOperation:

                slowest,

            fastestOperation:

                fastest,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const profilerReport =

    new ProfilerReport();



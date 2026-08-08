/**
==========================================================
AURA Trade OS
Network Health
Version : 0.3.0 Alpha
==========================================================
Network Health Check
==========================================================
*/

import { logger } from "@/services/logger";

export interface NetworkHealthReport {

    healthy: boolean;

    checkedAt: Date;

    issues: string[];

}

export class NetworkHealth {

    public async isHealthy(): Promise<boolean> {

        const report = await this.report();

        return report.healthy;

    }

    public async report(): Promise<NetworkHealthReport> {

        /*
        ==================================================
        Future implementation:

        Exchange API reachability
        WebSocket connectivity
        DNS resolution latency
        ==================================================
        */

        const issues: string[] = [];

        logger.debug("Network health checked.");

        return {
            healthy: issues.length === 0,
            checkedAt: new Date(),
            issues,
        };

    }

}

export const networkHealth =
    new NetworkHealth();

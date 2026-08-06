/**
==========================================================
AURA Trade OS
Network Metrics
Version : 0.3.0 Alpha
==========================================================
Network Domain Metrics
==========================================================
*/

import { bandwidthMonitor } from "./bandwidthMonitor";
import { connectionPool } from "./connectionPool";
import { dnsResolver } from "./dnsResolver";
import { proxyManager } from "./proxyManager";
import { networkHealth } from "./networkHealth";



/*
==========================================================
Types
==========================================================
*/

export interface NetworkMetrics {

    timestamp: Date;

    bandwidth: {

        uploadRate: number;

        downloadRate: number;

        bytesSent: number;

        bytesReceived: number;

    };



    connections: {

        active: number;

    };



    dns: {

        cacheSize: number;

    };



    proxy: {

        enabled: boolean;

    };



    health: {

        healthy: boolean;

    };

}





/*
==========================================================
Network Metrics
==========================================================
*/

export class NetworkMetricsService {

    public async snapshot():

        Promise<NetworkMetrics> {

        const bandwidth =

            bandwidthMonitor.current();



        const healthy =

            await networkHealth.isHealthy();



        return {

            timestamp: new Date(),

            bandwidth: {

                uploadRate:

                    bandwidth?.uploadRate ?? 0,

                downloadRate:

                    bandwidth?.downloadRate ?? 0,

                bytesSent:

                    bandwidth?.bytesSent ?? 0,

                bytesReceived:

                    bandwidth?.bytesReceived ?? 0,

            },

            connections: {

                active:

                    connectionPool.active().length,

            },

            dns: {

                cacheSize:

                    dnsResolver.size(),

            },

            proxy: {

                enabled:

                    proxyManager.isEnabled(),

            },

            health: {

                healthy,

            },

        };

    }

}





export const networkMetrics =

    new NetworkMetricsService();


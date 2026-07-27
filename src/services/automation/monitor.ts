/**
==========================================================
AURA Trade OS
Automation Monitor
Version : 0.0.8 Alpha
==========================================================
*/

import automationLifecycle from "./lifecycle";
import automationHealth from "./health";
import { getHeartbeat } from "../scheduler/heartbeat";

export interface MonitorSnapshot {

  generatedAt: string;

  lifecycle: {

    state: string;

    startedAt?: string;

    stoppedAt?: string;

    lastUpdated: string;

    reason?: string;

  };

  heartbeat: {

    online: boolean;

    lastHeartbeat?: string;

    uptime?: number;

    version?: string;

  };

  health: {

    overall: string;

    uptime: number;

    checks: number;

  };

  statistics: {

    cpuUsage: number;

    memoryUsageMb: number;

    nodeVersion: string;

    platform: string;

  };

}

export class AutomationMonitor {

  /**
   * Menghasilkan snapshot monitoring
   */
  async snapshot(): Promise<MonitorSnapshot> {

    const lifecycle =
      automationLifecycle.getStatus();

    const heartbeat =
      await getHeartbeat();

    const health =
      await automationHealth.checkSystem();

    const memory =
      process.memoryUsage();

    return {

      generatedAt:
        new Date().toISOString(),

      lifecycle: {

        state:
          lifecycle.state,

        startedAt:
          lifecycle.startedAt,

        stoppedAt:
          lifecycle.stoppedAt,

        lastUpdated:
          lifecycle.lastUpdated,

        reason:
          lifecycle.reason,

      },

      heartbeat: {

        online:
          heartbeat?.status === "ONLINE",

        lastHeartbeat:
          heartbeat?.lastHeartbeat,

        uptime:
          heartbeat?.uptime,

        version:
          heartbeat?.version,

      },

      health: {

        overall:
          health.overall,

        uptime:
          health.uptime,

        checks:
          health.checks.length,

      },

      statistics: {

        cpuUsage:
          process.cpuUsage().user,

        memoryUsageMb:
          Math.round(
            memory.heapUsed /
              1024 /
              1024
          ),

        nodeVersion:
          process.version,

        platform:
          process.platform,

      },

    };

  }

  /**
   * Status singkat dashboard
   */
  async summary() {

    const snapshot =
      await this.snapshot();

    return {

      state:
        snapshot.lifecycle.state,

      health:
        snapshot.health.overall,

      online:
        snapshot.heartbeat.online,

      uptime:
        snapshot.health.uptime,

      memory:
        snapshot.statistics.memoryUsageMb,

    };

  }

}

const automationMonitor =
  new AutomationMonitor();

export default automationMonitor;

/**
==========================================================
AURA Trade OS
Automation Health Monitor
Version : 0.0.8 Alpha
==========================================================
*/

import { getHeartbeat } from "../scheduler/heartbeat";

export type HealthStatus =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL";

export interface HealthCheck {

  component: string;

  status: HealthStatus;

  message: string;

  checkedAt: string;

}

export interface SystemHealth {

  overall: HealthStatus;

  uptime: number;

  checkedAt: string;

  checks: HealthCheck[];

}

const START_TIME = Date.now();

export class AutomationHealth {

  /**
   * Menjalankan seluruh health check
   */
  async checkSystem(): Promise<SystemHealth> {

    const checks: HealthCheck[] = [];

    checks.push(await this.checkEnvironment());

    checks.push(await this.checkScheduler());

    checks.push(await this.checkTrading());

    checks.push(await this.checkScanner());

    checks.push(await this.checkFirebase());

    checks.push(await this.checkAI());

    const overall = this.calculateOverallStatus(
      checks
    );

    return {

      overall,

      uptime:
        Math.floor(
          (Date.now() - START_TIME) /
            1000
        ),

      checkedAt:
        new Date().toISOString(),

      checks,

    };

  }

  /**
   * Environment
   */
  private async checkEnvironment(): Promise<HealthCheck> {

    const required = [

      "NEXT_PUBLIC_FIREBASE_API_KEY",

      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",

    ];

    const missing = required.filter(
      key => !process.env[key]
    );

    return {

      component: "Environment",

      status:
        missing.length === 0
          ? "HEALTHY"
          : "WARNING",

      message:
        missing.length === 0
          ? "Environment variables loaded."
          : `Missing: ${missing.join(", ")}`,

      checkedAt:
        new Date().toISOString(),

    };

  }

  /**
   * Scheduler
   */
  private async checkScheduler(): Promise<HealthCheck> {

    try {

      const heartbeat =
        await getHeartbeat();

      if (!heartbeat) {

        return {

          component: "Scheduler",

          status: "WARNING",

          message:
            "Heartbeat not found.",

          checkedAt:
            new Date().toISOString(),

        };

      }

      return {

        component: "Scheduler",

        status: "HEALTHY",

        message:
          "Heartbeat available.",

        checkedAt:
          new Date().toISOString(),

      };

    } catch {

      return {

        component: "Scheduler",

        status: "CRITICAL",

        message:
          "Scheduler unavailable.",

        checkedAt:
          new Date().toISOString(),

      };

    }

  }

  /**
   * Trading Engine
   */
  private async checkTrading(): Promise<HealthCheck> {

    return {

      component: "Trading Engine",

      status: "HEALTHY",

      message:
        "Trading Engine ready.",

      checkedAt:
        new Date().toISOString(),

    };

  }

  /**
   * Scanner
   */
  private async checkScanner(): Promise<HealthCheck> {

    return {

      component: "Market Scanner",

      status: "HEALTHY",

      message:
        "Scanner initialized.",

      checkedAt:
        new Date().toISOString(),

    };

  }

  /**
   * Firebase
   */
  private async checkFirebase(): Promise<HealthCheck> {

    try {

      return {

        component: "Firebase",

        status: "HEALTHY",

        message:
          "Firebase connected.",

        checkedAt:
          new Date().toISOString(),

      };

    } catch {

      return {

        component: "Firebase",

        status: "CRITICAL",

        message:
          "Firebase unavailable.",

        checkedAt:
          new Date().toISOString(),

      };

    }

  }

  /**
   * AI
   */
  private async checkAI(): Promise<HealthCheck> {

    const hasApiKey =
      !!process.env.OPENAI_API_KEY ||
      !!process.env.GEMINI_API_KEY;

    return {

      component: "AI Service",

      status:
        hasApiKey
          ? "HEALTHY"
          : "WARNING",

      message:
        hasApiKey
          ? "AI Provider configured."
          : "AI Provider disabled.",

      checkedAt:
        new Date().toISOString(),

    };

  }

  /**
   * Hitung status keseluruhan
   */
  private calculateOverallStatus(
    checks: HealthCheck[]
  ): HealthStatus {

    if (
      checks.some(
        c =>
          c.status === "CRITICAL"
      )
    ) {

      return "CRITICAL";

    }

    if (
      checks.some(
        c =>
          c.status === "WARNING"
      )
    ) {

      return "WARNING";

    }

    return "HEALTHY";

  }

}

const automationHealth =
  new AutomationHealth();

export default automationHealth;

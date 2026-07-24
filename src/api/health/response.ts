export interface HealthResponse {

  success: boolean;

  status: string;

  version: string;

  timestamp: string;

  environment: string;

  checks: {

    api: boolean;

    firebase: boolean;

    indodax: boolean;

    cron: boolean;

  };

}

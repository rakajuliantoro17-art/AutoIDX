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

  /**
   * Detail per-komponen dari systemHealth.check() (latency,
   * pesan, dll) -- opsional, untuk siapa pun yang butuh lebih
   * dari sekadar boolean ringkas di atas.
   */
  details?: unknown;

}

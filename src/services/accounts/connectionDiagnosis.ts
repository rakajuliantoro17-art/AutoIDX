/** Klasifikasi kegagalan uji koneksi Indodax (getInfo) menjadi diagnosis yang bisa ditindaklanjuti. */
export type ConnectionDiagnosis =
  | "OK"
  | "NO_ACTIVE_ACCOUNT"
  | "REJECTED_BY_INDODAX"
  | "BLOCKED_OR_NON_JSON"
  | "NETWORK_OR_TIMEOUT";

export function diagnoseGetInfoFailure(message: string): ConnectionDiagnosis {
  const m = message.toLowerCase();
  if (m.includes("unexpected token") || m.includes("json") || m.includes("403") || m.includes("<html")) {
    return "BLOCKED_OR_NON_JSON";
  }
  if (m.includes("abort") || m.includes("timeout") || m.includes("fetch failed") || m.includes("network")) {
    return "NETWORK_OR_TIMEOUT";
  }
  return "REJECTED_BY_INDODAX";
}

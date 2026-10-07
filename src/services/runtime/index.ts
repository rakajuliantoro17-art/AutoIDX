/**
 * AURA Trade OS -- Runtime
 *
 * Aktif: definisi tipe lingkungan + detectRuntimeEnvironment()
 * (serverless/container/cloud/local) dan tipe info/flags/profile/metrics.
 *
 * Mesin status berbasis memori (Runtime, Health, bootstrap), diagnostics,
 * inspector, optimizer, dan manager dipindah ke _shadow/runtime/ -- hanya
 * bermakna di proses berumur panjang (server fisik/container), tidak di
 * serverless. Lihat _shadow/runtime/README.md.
 */

export * from "./runtimeEnvironment";
export * from "./runtimeInfo";
export * from "./runtimeFlags";
export * from "./runtimeProfile";
export * from "./runtimeMetrics";

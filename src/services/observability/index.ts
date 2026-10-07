/**
 * AURA Trade OS -- Observability
 *
 * Aktif: Profiler + PhaseTimer (durasi per tahap siklus scan).
 *
 * Modul tracing (span, tracing, traceContext, correlation,
 * traceExporter, profilerReport) dipindah ke _shadow/observability/
 * (di luar build) karena menyimpan span tanpa batas dan memakai
 * state global per instance -- tidak aman untuk serverless. Lihat
 * _shadow/observability/README.md untuk syarat mengaktifkannya lagi.
 */

export * from "./profiler";
export * from "./phaseTimer";

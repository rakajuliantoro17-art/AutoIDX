/**
==========================================================
AURA Trade OS
Latency Monitor
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: history sebelumnya HANYA di Map in-memory
-- hilang total tiap invocation serverless baru, jadi statistics()
yang dibaca dari request/cron LAIN selalu kosong (persis masalah
yang sudah diperbaiki di health/checks/schedulerHealth.ts).

Sekarang: measure()/statistics()/getHistory() tetap in-memory
(SENGAJA -- ini scoped ke SATU siklus cron/scan, dipakai untuk
agregasi selama siklus itu berjalan). Yang baru: flush() menulis
SATU dokumen ringkasan (bukan satu dokumen per pengukuran) ke
Firestore di akhir siklus, dan getRecentStats() membaca riwayat
ringkasan itu lintas waktu -- ini yang membuat data latensi
akhirnya benar-benar bisa dipantau trennya, bukan cuma hidup
sesaat lalu hilang.

Disimpan di subcollection per target (latency_stats/{target}/
entries) supaya query riwayat cukup orderBy satu field saja
(tanpa where+orderBy field berbeda), menghindari kebutuhan
composite index Firestore yang harus dibuat manual.
==========================================================
*/

import logger from "@/services/logger";
import { adminDb } from "@/services/firebase/admin";

/*
==========================================================
Types
==========================================================
*/

export interface LatencyResult {
    target: string;
    latency: number;
    success: boolean;
    timestamp: number;
}

export interface LatencyStatistics {
    count: number;
    minimum: number;
    maximum: number;
    average: number;
}

/*
==========================================================
Latency Monitor
==========================================================
*/

export class LatencyMonitor {

    private readonly history =
        new Map<string, number[]>();

    /*
    ======================================================
    Measure
    ======================================================
    */

    public async measure(
        target: string,
        task: () => Promise<unknown>,
    ): Promise<LatencyResult> {

        const started = performance.now();

        try {

            await task();

            const latency =
                performance.now() - started;

            this.store(target, latency);

            return {
                target,
                latency,
                success: true,
                timestamp: Date.now(),
            };

        }
        catch (error) {

            const latency =
                performance.now() - started;

            logger.error(
                "Latency measurement failed.",
                error,
                { target, latency },
            );

            return {
                target,
                latency,
                success: false,
                timestamp: Date.now(),
            };

        }

    }

    /*
    ======================================================
    Store (in-memory, scoped ke satu siklus -- lihat flush())
    ======================================================
    */

    private store(
        target: string,
        latency: number,
    ): void {

        const values =
            this.history.get(target) ?? [];

        values.push(latency);

        if (values.length > 100) {
            values.shift();
        }

        this.history.set(target, values);

    }

    /*
    ======================================================
    Statistics (in-memory, siklus berjalan saat ini)
    ======================================================
    */

    public statistics(
        target: string,
    ): LatencyStatistics | null {

        const values =
            this.history.get(target);

        if (!values || values.length === 0) {
            return null;
        }

        const total =
            values.reduce((sum, value) => sum + value, 0);

        return {
            count: values.length,
            minimum: Math.min(...values),
            maximum: Math.max(...values),
            average:
                Number((total / values.length).toFixed(2)),
        };

    }

    /*
    ======================================================
    History (in-memory, siklus berjalan saat ini)
    ======================================================
    */

    public getHistory(target: string): number[] {
        return [...(this.history.get(target) ?? [])];
    }

    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(target?: string): void {

        if (target) {
            this.history.delete(target);
            return;
        }

        this.history.clear();

    }

    /*
    ======================================================
    Flush -- BARU. Tulis SATU dokumen ringkasan siklus ini ke
    Firestore, lalu bersihkan in-memory untuk siklus berikutnya.
    Panggil ini SEKALI di akhir satu siklus cron/scan (bukan di
    tiap measure()) supaya tidak boros write Firestore.
    ======================================================
    */

    public async flush(target: string): Promise<void> {

        const stats = this.statistics(target);

        if (!stats) {
            return;
        }

        try {

            await adminDb
                .collection("latency_stats")
                .doc(target)
                .collection("entries")
                .add({
                    ...stats,
                    recordedAt: Date.now(),
                });

        } catch (error) {

            // Kegagalan simpan metrik TIDAK BOLEH mengganggu
            // trading -- ini murni observability tambahan.
            console.error(
                "[LatencyMonitor] Failed to flush stats to Firestore",
                error,
            );

        } finally {

            this.clear(target);

        }

    }

    /*
    ======================================================
    Riwayat ringkasan lintas siklus (BARU) -- dipakai untuk
    memantau tren, mis. di endpoint health/dashboard.
    ======================================================
    */

    public async getRecentStats(
        target: string,
        limit = 20,
    ): Promise<Array<LatencyStatistics & { recordedAt: number }>> {

        try {

            const snapshot = await adminDb
                .collection("latency_stats")
                .doc(target)
                .collection("entries")
                .orderBy("recordedAt", "desc")
                .limit(limit)
                .get();

            return snapshot.docs.map(
                (doc) => doc.data() as LatencyStatistics & { recordedAt: number },
            );

        } catch (error) {

            console.error(
                "[LatencyMonitor] Failed to read stats history",
                error,
            );

            return [];

        }

    }

}

/*
==========================================================
Singleton
==========================================================
*/

export const latencyMonitor =
    new LatencyMonitor();

export default latencyMonitor;

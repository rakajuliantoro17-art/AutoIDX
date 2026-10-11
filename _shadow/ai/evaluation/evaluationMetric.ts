/**
==========================================================
AURA Trade OS
AI Evaluation Metric
Phase 32
==========================================================
*/

export type EvaluationMetricName =
    | "ACCURACY"
    | "PRECISION"
    | "RECALL"
    | "F1"
    | "MAE"
    | "MSE"
    | "RMSE"
    | "WIN_RATE"
    | "PROFIT_FACTOR"
    | "EXPECTANCY"
    | "MAX_DRAWDOWN"
    | "SHARPE_RATIO"
    | "SORTINO_RATIO"
    | "RETURN";

export interface EvaluationMetric {
    readonly name: EvaluationMetricName;
    readonly value: number;
    readonly higherIsBetter: boolean;
    readonly metadata:
        Record<string, unknown>;
}

export function createEvaluationMetric(
    name: EvaluationMetricName,
    value: number,
    options?: {
        readonly higherIsBetter?: boolean;
        readonly metadata?: Record<string, unknown>;
    },
): EvaluationMetric {
    return {
        name,
        value,
        higherIsBetter:
            options?.higherIsBetter ??
            defaultHigherIsBetter(
                name,
            ),
        metadata:
            options?.metadata ?? {},
    };
}

function defaultHigherIsBetter(
    name: EvaluationMetricName,
): boolean {
    switch (name) {
        case "MAE":
        case "MSE":
        case "RMSE":
        case "MAX_DRAWDOWN":
            return false;

        default:
            return true;
    }
}

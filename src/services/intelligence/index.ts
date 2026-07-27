/**
==========================================================
AURA Trade OS
Intelligence Layer
Version : 0.1.0 Alpha
==========================================================
*/

/* ======================================================
 * Types
 * ====================================================== */

export * from "./types";

/* ======================================================
 * AI Engine
 * ====================================================== */

export {
  default as aiClient,
} from "./ai/client";

export {
  default as aiAnalyzer,
} from "./ai/analyzer";

export {
  default as aiConfidence,
} from "./ai/confidence";

export {
  default as aiExplanation,
} from "./ai/explanation";

export {
  default as aiPrompt,
} from "./ai/prompt";

/* ======================================================
 * Feature Engineering
 * ====================================================== */

export {
  default as featureBuilder,
} from "./features/builder";

export {
  default as featureIndicators,
} from "./features/indicators";

export {
  default as featureNormalization,
} from "./features/normalization";

export {
  default as featureVector,
} from "./features/vector";

/* ======================================================
 * Market Context
 * ====================================================== */

export {
  default as marketContext,
} from "./context/marketContext";

export {
  default as marketTrend,
} from "./context/trend";

export {
  default as marketMomentum,
} from "./context/momentum";

export {
  default as marketVolatility,
} from "./context/volatility";

export {
  default as marketLiquidity,
} from "./context/liquidity";

/* ======================================================
 * Decision Fusion
 * ====================================================== */

export {
  default as decisionFusion,
} from "./fusion/decision";

export {
  default as decisionVoting,
} from "./fusion/voting";

export {
  default as confidenceFusion,
} from "./fusion/confidence";

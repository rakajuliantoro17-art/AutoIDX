/**
==========================================================
AURA Trade OS
ML Labeling Module Gateway
Version : 0.1.0 Alpha
==========================================================
*/


/**
 * Label Engine
 */

export {

  default as labelingEngine,

  LabelingEngine

} from "./engine";



/**
 * Label Validator
 */

export {

  default as labelValidator,

  LabelValidator

} from "./validator";



/**
 * Label Strategies
 */

export {

  labelingStrategies,

  ReturnStrategy,

  TrendStrategy,

  MeanReversionStrategy,

  BreakoutStrategy,

  TripleBarrierStrategy

} from "./strategies";



/**
 * Label Rules
 */

export {

  default as labelRuleManager,

  LabelRuleManager

} from "./rules";



/**
 * Outcome Analyzer
 */

export {

  default as outcomeAnalyzer,

  OutcomeAnalyzer

} from "./outcome";


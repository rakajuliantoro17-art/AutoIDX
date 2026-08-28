# Daftar Lengkap File Orphan — AutoIDX

**Total: 776 file** dari 1074 file source (audit ulang, sudah termasuk App Router `src/app/**` sebagai entry point yang benar).

Orphan = file yang tidak pernah di-`import` dari file manapun yang benar-benar terhubung ke routing Next.js (baik `src/pages/**` maupun `src/app/**/page.tsx|route.ts|layout.tsx` dkk).

---

## Ringkasan per kategori

| Folder | Jumlah file |
|---|---|
| `src/services/ai/` | 75 |
| `src/services/liveTrading/` | 74 |
| `src/services/ml/` | 28 |
| `src/services/integration/` | 27 |
| `src/services/events/` | 25 |
| `src/services/market/` | 24 |
| `src/services/backtest/` | 23 |
| `src/services/intelligence/` | 23 |
| `src/services/errors/` | 22 |
| `src/services/execution/` | 21 |
| `src/services/bus/` | 20 |
| `src/services/orchestration/` | 20 |
| `src/services/paperTrading/` | 20 |
| `src/services/transaction/` | 20 |
| `src/services/commands/` | 19 |
| `src/services/portfolio/` | 17 |
| `src/services/indicator/` | 16 |
| `src/lib/validators/` | 15 |
| `src/services/indodax/` | 14 |
| `src/services/runtime/` | 13 |
| `src/services/cache/` | 12 |
| `src/services/monitor/` | 10 |
| `src/services/network/` | 10 |
| `src/services/plugins/` | 10 |
| `src/services/security/` | 10 |
| `src/services/automation/` | 9 |
| `src/services/configuration/` | 9 |
| `src/services/diagnostics/` | 9 |
| `src/services/pipeline/` | 9 |
| `src/services/resilience/` | 9 |
| `src/services/telemetry/` | 9 |
| `src/services/validation/` | 9 |
| `src/api/bot/` | 8 |
| `src/services/observability/` | 8 |
| `src/services/scheduler/` | 8 |
| `src/services/discovery/` | 7 |
| `src/services/metrics/` | 7 |
| `src/services/middleware/` | 7 |
| `src/services/recovery/` | 7 |
| `src/services/bootstrap/` | 6 |
| `src/services/core/` | 6 |
| `src/services/serialization/` | 6 |
| `src/services/trading/` | 6 |
| `src/services/analytics/` | 5 |
| `src/services/jobs/` | 5 |
| `src/services/logger/` | 5 |
| `src/services/maintenance/` | 5 |
| `src/services/persistence/` | 5 |
| `src/services/safety/` | 5 |
| `src/services/strategy/` | 5 |
| `src/lib/error/` | 4 |
| `src/services/audit/` | 4 |
| `src/api/webhook/` | 3 |
| `src/services/indicators/` | 2 |
| `src/api/settings/` | 1 |
| `src/components/ActivityView.tsx/` | 1 |
| `src/components/BacktestSummary.tsx/` | 1 |
| `src/components/DashboardOverview.tsx/` | 1 |
| `src/components/RecentActivity.tsx/` | 1 |
| `src/config/constants.ts/` | 1 |
| `src/config/env.ts/` | 1 |
| `src/config/limits.ts/` | 1 |
| `src/errors/ExchangeError.ts/` | 1 |
| `src/errors/TradingError.ts/` | 1 |
| `src/errors/ValidationError.ts/` | 1 |
| `src/errors/index.ts/` | 1 |
| `src/scripts/checkBuild.ts/` | 1 |
| `src/scripts/validateEnv.ts/` | 1 |
| `src/services/exchange/` | 1 |
| `src/services/index.ts/` | 1 |
| `src/services/reconciliation/` | 1 |
| `src/utils/constants.ts/` | 1 |
| `src/utils/dateTime.ts/` | 1 |
| `src/utils/formatters.ts/` | 1 |
| `src/utils/index.ts/` | 1 |

---

## Daftar lengkap (per kategori)


### `src/services/ai/` (75 file)

- `src/services/ai/aiContext.ts`
- `src/services/ai/aiManager.ts`
- `src/services/ai/aiRegistry.ts`
- `src/services/ai/decision/decisionEngine.ts`
- `src/services/ai/decision/decisionInput.ts`
- `src/services/ai/decision/decisionManager.ts`
- `src/services/ai/decision/decisionModel.ts`
- `src/services/ai/decision/decisionOutput.ts`
- `src/services/ai/evaluation/evaluationDataset.ts`
- `src/services/ai/evaluation/evaluationManager.ts`
- `src/services/ai/evaluation/evaluationMetric.ts`
- `src/services/ai/evaluation/evaluationResult.ts`
- `src/services/ai/evaluation/evaluationSample.ts`
- `src/services/ai/evaluation/modelEvaluator.ts`
- `src/services/ai/evaluation/predictionEvaluator.ts`
- `src/services/ai/features/feature.ts`
- `src/services/ai/features/featureExtractor.ts`
- `src/services/ai/features/featureNormalizer.ts`
- `src/services/ai/features/featureRegistry.ts`
- `src/services/ai/features/featureScaler.ts`
- `src/services/ai/features/featureSet.ts`
- `src/services/ai/features/featureValidator.ts`
- `src/services/ai/index.ts`
- `src/services/ai/lifecycle/index.ts`
- `src/services/ai/lifecycle/modelArtifact.ts`
- `src/services/ai/lifecycle/modelLifecycle.ts`
- `src/services/ai/lifecycle/modelLifecycleManager.ts`
- `src/services/ai/lifecycle/modelLifecycleRegistry.ts`
- `src/services/ai/lifecycle/modelMetadata.ts`
- `src/services/ai/lifecycle/modelStatus.ts`
- `src/services/ai/lifecycle/modelVersion.ts`
- `src/services/ai/optimizer/optimizerEngine.ts`
- `src/services/ai/optimizer/optimizerInput.ts`
- `src/services/ai/optimizer/optimizerManager.ts`
- `src/services/ai/optimizer/optimizerModel.ts`
- `src/services/ai/optimizer/optimizerOutput.ts`
- `src/services/ai/pipeline/aiPipeline.ts`
- `src/services/ai/pipeline/aiPipelineContext.ts`
- `src/services/ai/pipeline/aiPipelineManager.ts`
- `src/services/ai/pipeline/aiPipelineResult.ts`
- `src/services/ai/pipeline/aiPipelineStage.ts`
- `src/services/ai/prediction/predictionContext.ts`
- `src/services/ai/prediction/predictionManager.ts`
- `src/services/ai/runtime/modelExecutor.ts`
- `src/services/ai/runtime/modelLoader.ts`
- `src/services/ai/runtime/modelRegistry.ts`
- `src/services/ai/runtime/modelRuntime.ts`
- `src/services/ai/runtime/modelRuntimeConfig.ts`
- `src/services/ai/runtime/modelRuntimeContext.ts`
- `src/services/ai/runtime/modelRuntimeResult.ts`
- `src/services/ai/selection/index.ts`
- `src/services/ai/selection/modelScore.ts`
- `src/services/ai/selection/modelSelection.ts`
- `src/services/ai/selection/modelSelectionManager.ts`
- `src/services/ai/selection/modelSelector.ts`
- `src/services/ai/training/dataset/datasetBuilder.ts`
- `src/services/ai/training/dataset/datasetManager.ts`
- `src/services/ai/training/dataset/datasetNormalizer.ts`
- `src/services/ai/training/dataset/datasetRecord.ts`
- `src/services/ai/training/dataset/datasetSchema.ts`
- `src/services/ai/training/dataset/datasetSplit.ts`
- `src/services/ai/training/dataset/datasetValidator.ts`
- `src/services/ai/training/index.ts`
- `src/services/ai/training/pipeline/featurePipeline.ts`
- `src/services/ai/training/pipeline/index.ts`
- `src/services/ai/training/pipeline/preprocessingPipeline.ts`
- `src/services/ai/training/pipeline/trainingPipeline.ts`
- `src/services/ai/training/training/trainingConfig.ts`
- `src/services/ai/training/training/trainingEngine.ts`
- `src/services/ai/training/training/trainingJob.ts`
- `src/services/ai/training/training/trainingManager.ts`
- `src/services/ai/training/training/trainingProgress.ts`
- `src/services/ai/training/training/trainingRegistry.ts`
- `src/services/ai/training/training/trainingRequest.ts`
- `src/services/ai/training/training/trainingResult.ts`

### `src/services/liveTrading/` (74 file)

- `src/services/liveTrading/audit/executionAudit.ts`
- `src/services/liveTrading/audit/index.ts`
- `src/services/liveTrading/canary/canaryConfig.ts`
- `src/services/liveTrading/canary/canaryContext.ts`
- `src/services/liveTrading/canary/canaryDecision.ts`
- `src/services/liveTrading/canary/canaryExecutionService.ts`
- `src/services/liveTrading/canary/canaryExecutor.ts`
- `src/services/liveTrading/canary/canaryGate.ts`
- `src/services/liveTrading/canary/canaryGuard.ts`
- `src/services/liveTrading/canary/canaryManager.ts`
- `src/services/liveTrading/canary/canaryResult.ts`
- `src/services/liveTrading/canary/index.ts`
- `src/services/liveTrading/engine.ts`
- `src/services/liveTrading/engine/liveTradingConfig.ts`
- `src/services/liveTrading/engine/liveTradingContext.ts`
- `src/services/liveTrading/engine/liveTradingEngine.ts`
- `src/services/liveTrading/engine/liveTradingResult.ts`
- `src/services/liveTrading/engine/liveTradingRunner.ts`
- `src/services/liveTrading/exchange/account.ts`
- `src/services/liveTrading/exchange/createIndodaxExchangeClient.ts`
- `src/services/liveTrading/exchange/exchangeClient.ts`
- `src/services/liveTrading/exchange/exchangeOrder.ts`
- `src/services/liveTrading/exchange/exchangeResponse.ts`
- `src/services/liveTrading/exchange/index.ts`
- `src/services/liveTrading/exchange/indodaxAdapter.ts`
- `src/services/liveTrading/exchange/indodaxAuth.ts`
- `src/services/liveTrading/exchange/indodaxResponse.ts`
- `src/services/liveTrading/exchange/indodaxSigner.ts`
- `src/services/liveTrading/exchange/market.ts`
- `src/services/liveTrading/exchange/orderExecutor.ts`
- `src/services/liveTrading/execution/autoTradingController.ts`
- `src/services/liveTrading/execution/dryRunController.ts`
- `src/services/liveTrading/execution/executionPreflight.ts`
- `src/services/liveTrading/execution/executionReconciler.ts`
- `src/services/liveTrading/execution/executionSimulation.ts`
- `src/services/liveTrading/execution/executionState.ts`
- `src/services/liveTrading/execution/executionSupervisor.ts`
- `src/services/liveTrading/execution/executionTestReport.ts`
- `src/services/liveTrading/execution/executionVerifier.ts`
- `src/services/liveTrading/execution/fillHandler.ts`
- `src/services/liveTrading/execution/index.ts`
- `src/services/liveTrading/execution/liveExecutionBridge.ts`
- `src/services/liveTrading/execution/liveOrderExecutor.ts`
- `src/services/liveTrading/execution/orderIdempotency.ts`
- `src/services/liveTrading/execution/orderManager.ts`
- `src/services/liveTrading/execution/orderTracker.ts`
- `src/services/liveTrading/execution/reconciliationService.ts`
- `src/services/liveTrading/gate/duplicateOrderGuard.ts`
- `src/services/liveTrading/gate/idempotencyKey.ts`
- `src/services/liveTrading/gate/idempotencyStore.ts`
- `src/services/liveTrading/gate/killSwitch.ts`
- `src/services/liveTrading/gate/liveApproval.ts`
- `src/services/liveTrading/gate/liveOrderGate.ts`
- `src/services/liveTrading/gate/liveTradingGuard.ts`
- `src/services/liveTrading/gate/uncertainExecutionGuard.ts`
- `src/services/liveTrading/index.ts`
- `src/services/liveTrading/monitor/health.ts`
- `src/services/liveTrading/monitor/heartbeat.ts`
- `src/services/liveTrading/monitor/killSwitch.ts`
- `src/services/liveTrading/monitor/liveTradingConfig.ts`
- `src/services/liveTrading/monitor/productionGate.ts`
- `src/services/liveTrading/monitor/productionReadiness.ts`
- `src/services/liveTrading/monitoring/liveExecutionMetrics.ts`
- `src/services/liveTrading/monitoring/liveHealth.ts`
- `src/services/liveTrading/monitoring/liveTradeLog.ts`
- `src/services/liveTrading/persistence/executionPersistence.ts`
- `src/services/liveTrading/persistence/index.ts`
- `src/services/liveTrading/reconciliation/executionReconciliation.ts`
- `src/services/liveTrading/reconciliation/index.ts`
- `src/services/liveTrading/reconciliation/reconciliationGuard.ts`
- `src/services/liveTrading/reconciliation/reconciliationResult.ts`
- `src/services/liveTrading/risk/exposure.ts`
- `src/services/liveTrading/risk/positionLimit.ts`
- `src/services/liveTrading/risk/riskManager.ts`

### `src/services/ml/` (28 file)

- `src/services/ml/dataset/exporter.ts`
- `src/services/ml/dataset/importer.ts`
- `src/services/ml/dataset/index.ts`
- `src/services/ml/dataset/sampler.ts`
- `src/services/ml/dataset/validator.ts`
- `src/services/ml/features/encoder.ts`
- `src/services/ml/features/index.ts`
- `src/services/ml/features/normalizer.ts`
- `src/services/ml/features/scaler.ts`
- `src/services/ml/features/selector.ts`
- `src/services/ml/features/statistics.ts`
- `src/services/ml/features/vectorizer.ts`
- `src/services/ml/index.ts`
- `src/services/ml/labeling/engine.ts`
- `src/services/ml/labeling/index.ts`
- `src/services/ml/labeling/outcome.ts`
- `src/services/ml/labeling/rules.ts`
- `src/services/ml/labeling/strategies.ts`
- `src/services/ml/labeling/validator.ts`
- `src/services/ml/manager.ts`
- `src/services/ml/models/evaluator.ts`
- `src/services/ml/models/index.ts`
- `src/services/ml/models/registry.ts`
- `src/services/ml/pipeline.ts`
- `src/services/ml/storage/archive.ts`
- `src/services/ml/storage/index.ts`
- `src/services/ml/storage/loader.ts`
- `src/services/ml/storage/repository.ts`

### `src/services/integration/` (27 file)

- `src/services/integration/executionIntegration.ts`
- `src/services/integration/finalIntegrationCheck.ts`
- `src/services/integration/index.ts`
- `src/services/integration/integrationBootstrap.ts`
- `src/services/integration/integrationContext.ts`
- `src/services/integration/integrationDiagnostics.ts`
- `src/services/integration/integrationError.ts`
- `src/services/integration/integrationEventBridge.ts`
- `src/services/integration/integrationEvents.ts`
- `src/services/integration/integrationGuard.ts`
- `src/services/integration/integrationHealth.ts`
- `src/services/integration/integrationLifecycle.ts`
- `src/services/integration/integrationManager.ts`
- `src/services/integration/integrationRegistry.ts`
- `src/services/integration/integrationResult.ts`
- `src/services/integration/integrationRunner.ts`
- `src/services/integration/integrationTypes.ts`
- `src/services/integration/integrationValidator.ts`
- `src/services/integration/liveTradingGate.ts`
- `src/services/integration/observabilityIntegration.ts`
- `src/services/integration/persistenceIntegration.ts`
- `src/services/integration/productionGate.ts`
- `src/services/integration/productionReadiness.ts`
- `src/services/integration/recoveryIntegration.ts`
- `src/services/integration/riskIntegration.ts`
- `src/services/integration/runtimeIntegration.ts`
- `src/services/integration/tradingIntegration.ts`

### `src/services/events/` (25 file)

- `src/services/events/event.ts`
- `src/services/events/eventBus.ts`
- `src/services/events/eventCategory.ts`
- `src/services/events/eventContext.ts`
- `src/services/events/eventDispatcher.ts`
- `src/services/events/eventEmitter.ts`
- `src/services/events/eventHandler.ts`
- `src/services/events/eventListener.ts`
- `src/services/events/eventManager.ts`
- `src/services/events/eventMetadata.ts`
- `src/services/events/eventMiddleware.ts`
- `src/services/events/eventNormalizer.ts`
- `src/services/events/eventPayload.ts`
- `src/services/events/eventPriority.ts`
- `src/services/events/eventPublisher.ts`
- `src/services/events/eventQueue.ts`
- `src/services/events/eventRegistry.ts`
- `src/services/events/eventResult.ts`
- `src/services/events/eventSerializer.ts`
- `src/services/events/eventStatus.ts`
- `src/services/events/eventSubscriber.ts`
- `src/services/events/eventType.ts`
- `src/services/events/eventTypes.ts`
- `src/services/events/index.ts`
- `src/services/events/systemEvents.ts`

### `src/services/market/` (24 file)

- `src/services/market/aggregators/index.ts`
- `src/services/market/aggregators/orderBookAggregator.ts`
- `src/services/market/aggregators/tradeAggregator.ts`
- `src/services/market/candles/candleBuilder.ts`
- `src/services/market/feeds/candleFeed.ts`
- `src/services/market/feeds/index.ts`
- `src/services/market/feeds/orderBookFeed.ts`
- `src/services/market/feeds/tickerFeed.ts`
- `src/services/market/feeds/tradeFeed.ts`
- `src/services/market/filters/index.ts`
- `src/services/market/filters/volatilityFilter.ts`
- `src/services/market/filters/volumeFilter.ts`
- `src/services/market/index.ts`
- `src/services/market/manager.ts`
- `src/services/market/orderbook/orderBook.ts`
- `src/services/market/registry.ts`
- `src/services/market/snapshots/index.ts`
- `src/services/market/snapshots/marketSnapshot.ts`
- `src/services/market/snapshots/orderBookSnapshot.ts`
- `src/services/market/snapshots/tickerSnapshot.ts`
- `src/services/market/ticker/tickerService.ts`
- `src/services/market/types.ts`
- `src/services/market/websocket/indodaxSocket.ts`
- `src/services/market/websocket/manager.ts`

### `src/services/backtest/` (23 file)

- `src/services/backtest/engine.ts`
- `src/services/backtest/engine/backtestClock.ts`
- `src/services/backtest/engine/backtestConfig.ts`
- `src/services/backtest/engine/backtestContext.ts`
- `src/services/backtest/engine/backtestEngine.ts`
- `src/services/backtest/engine/backtestResult.ts`
- `src/services/backtest/engine/backtestRunner.ts`
- `src/services/backtest/execution/executionSimulator.ts`
- `src/services/backtest/execution/simulatedFill.ts`
- `src/services/backtest/execution/simulatedOrder.ts`
- `src/services/backtest/execution/slippageModel.ts`
- `src/services/backtest/index.ts`
- `src/services/backtest/market/historicalCandle.ts`
- `src/services/backtest/market/historicalDataset.ts`
- `src/services/backtest/market/marketReplay.ts`
- `src/services/backtest/market/priceResolver.ts`
- `src/services/backtest/metrics/drawdownAnalyzer.ts`
- `src/services/backtest/metrics/performanceMetrics.ts`
- `src/services/backtest/metrics/tradeStatistics.ts`
- `src/services/backtest/portfolio/portfolioSnapshot.ts`
- `src/services/backtest/portfolio/simulatedPortfolio.ts`
- `src/services/backtest/portfolio/simulatedPosition.ts`
- `src/services/backtest/run.ts`

### `src/services/intelligence/` (23 file)

- `src/services/intelligence/aggregators/marketAggregator.ts`
- `src/services/intelligence/aggregators/portfolioAggregator.ts`
- `src/services/intelligence/aggregators/sentimentAggregator.ts`
- `src/services/intelligence/ai/analyzer.ts`
- `src/services/intelligence/ai/cache.ts`
- `src/services/intelligence/ai/client.ts`
- `src/services/intelligence/ai/orchestrator.ts`
- `src/services/intelligence/ai/promptTemplates.ts`
- `src/services/intelligence/ai/providers/local.ts`
- `src/services/intelligence/ai/providers/notebooklm.ts`
- `src/services/intelligence/ai/router.ts`
- `src/services/intelligence/ai/sentiment.ts`
- `src/services/intelligence/cache/intelligenceCache.ts`
- `src/services/intelligence/features/builder.ts`
- `src/services/intelligence/features/indicators.ts`
- `src/services/intelligence/features/normalization.ts`
- `src/services/intelligence/features/vector.ts`
- `src/services/intelligence/filters/marketFilter.ts`
- `src/services/intelligence/fusion/voting.ts`
- `src/services/intelligence/health/health.ts`
- `src/services/intelligence/index.ts`
- `src/services/intelligence/manager.ts`
- `src/services/intelligence/registry.ts`

### `src/services/errors/` (22 file)

- `src/services/errors/configurationError.ts`
- `src/services/errors/error.ts`
- `src/services/errors/errorCategory.ts`
- `src/services/errors/errorCode.ts`
- `src/services/errors/errorContext.ts`
- `src/services/errors/errorFactory.ts`
- `src/services/errors/errorHandler.ts`
- `src/services/errors/errorManager.ts`
- `src/services/errors/errorMetadata.ts`
- `src/services/errors/errorNormalizer.ts`
- `src/services/errors/errorRegistry.ts`
- `src/services/errors/errorSerializer.ts`
- `src/services/errors/errorSeverity.ts`
- `src/services/errors/exchangeError.ts`
- `src/services/errors/index.ts`
- `src/services/errors/marketError.ts`
- `src/services/errors/networkError.ts`
- `src/services/errors/operationalError.ts`
- `src/services/errors/riskError.ts`
- `src/services/errors/runtimeError.ts`
- `src/services/errors/strategyError.ts`
- `src/services/errors/validationError.ts`

### `src/services/execution/` (21 file)

- `src/services/execution/adapters/exchangeAdapter.ts`
- `src/services/execution/adapters/indodaxAdapter.ts`
- `src/services/execution/adapters/mockAdapter.ts`
- `src/services/execution/executionEngine.ts`
- `src/services/execution/executionLogger.ts`
- `src/services/execution/index.ts`
- `src/services/execution/manager.ts`
- `src/services/execution/orders/limitOrder.ts`
- `src/services/execution/orders/marketOrder.ts`
- `src/services/execution/orders/orderBuilder.ts`
- `src/services/execution/orders/stopOrder.ts`
- `src/services/execution/orders/takeProfit.ts`
- `src/services/execution/registry.ts`
- `src/services/execution/risk/exposure.ts`
- `src/services/execution/risk/positionSizing.ts`
- `src/services/execution/risk/stopLoss.ts`
- `src/services/execution/risk/takeProfit.ts`
- `src/services/execution/types.ts`
- `src/services/execution/validation/balanceValidator.ts`
- `src/services/execution/validation/orderValidator.ts`
- `src/services/execution/validation/positionValidator.ts`

### `src/services/bus/` (20 file)

- `src/services/bus/bus.ts`
- `src/services/bus/busContext.ts`
- `src/services/bus/busDispatcher.ts`
- `src/services/bus/busError.ts`
- `src/services/bus/busHandler.ts`
- `src/services/bus/busMessage.ts`
- `src/services/bus/busMiddleware.ts`
- `src/services/bus/busRegistry.ts`
- `src/services/bus/busResult.ts`
- `src/services/bus/busType.ts`
- `src/services/bus/commandBus.ts`
- `src/services/bus/commandHandler.ts`
- `src/services/bus/commandRegistry.ts`
- `src/services/bus/eventBus.ts`
- `src/services/bus/eventHandler.ts`
- `src/services/bus/eventRegistry.ts`
- `src/services/bus/index.ts`
- `src/services/bus/messageProcessor.ts`
- `src/services/bus/messageQueue.ts`
- `src/services/bus/messageRouter.ts`

### `src/services/orchestration/` (20 file)

- `src/services/orchestration/index.ts`
- `src/services/orchestration/orchestrationContext.ts`
- `src/services/orchestration/orchestrationEngine.ts`
- `src/services/orchestration/orchestrationResult.ts`
- `src/services/orchestration/workflow.ts`
- `src/services/orchestration/workflowContext.ts`
- `src/services/orchestration/workflowDefinition.ts`
- `src/services/orchestration/workflowError.ts`
- `src/services/orchestration/workflowExecutor.ts`
- `src/services/orchestration/workflowManager.ts`
- `src/services/orchestration/workflowMiddleware.ts`
- `src/services/orchestration/workflowPersistence.ts`
- `src/services/orchestration/workflowRecovery.ts`
- `src/services/orchestration/workflowRegistry.ts`
- `src/services/orchestration/workflowResult.ts`
- `src/services/orchestration/workflowScheduler.ts`
- `src/services/orchestration/workflowState.ts`
- `src/services/orchestration/workflowStatus.ts`
- `src/services/orchestration/workflowStep.ts`
- `src/services/orchestration/workflowType.ts`

### `src/services/paperTrading/` (20 file)

- `src/services/paperTrading/engine/paperTradingConfig.ts`
- `src/services/paperTrading/engine/paperTradingContext.ts`
- `src/services/paperTrading/engine/paperTradingEngine.ts`
- `src/services/paperTrading/engine/paperTradingResult.ts`
- `src/services/paperTrading/engine/paperTradingRunner.ts`
- `src/services/paperTrading/execution/paperExecution.ts`
- `src/services/paperTrading/execution/paperFill.ts`
- `src/services/paperTrading/execution/paperOrder.ts`
- `src/services/paperTrading/execution/paperSlippage.ts`
- `src/services/paperTrading/index.ts`
- `src/services/paperTrading/market/marketSubscription.ts`
- `src/services/paperTrading/market/marketTick.ts`
- `src/services/paperTrading/market/priceFeed.ts`
- `src/services/paperTrading/market/realtimeMarket.ts`
- `src/services/paperTrading/monitoring/paperHealth.ts`
- `src/services/paperTrading/monitoring/paperMetrics.ts`
- `src/services/paperTrading/monitoring/paperTradeLog.ts`
- `src/services/paperTrading/portfolio/paperPortfolio.ts`
- `src/services/paperTrading/portfolio/paperPosition.ts`
- `src/services/paperTrading/portfolio/paperSnapshot.ts`

### `src/services/transaction/` (20 file)

- `src/services/transaction/executionContext.ts`
- `src/services/transaction/executionMetadata.ts`
- `src/services/transaction/executionTracker.ts`
- `src/services/transaction/index.ts`
- `src/services/transaction/transaction.ts`
- `src/services/transaction/transactionContext.ts`
- `src/services/transaction/transactionCoordinator.ts`
- `src/services/transaction/transactionError.ts`
- `src/services/transaction/transactionExecutor.ts`
- `src/services/transaction/transactionFactory.ts`
- `src/services/transaction/transactionLifecycle.ts`
- `src/services/transaction/transactionManager.ts`
- `src/services/transaction/transactionMetadata.ts`
- `src/services/transaction/transactionRegistry.ts`
- `src/services/transaction/transactionResult.ts`
- `src/services/transaction/transactionScope.ts`
- `src/services/transaction/transactionState.ts`
- `src/services/transaction/transactionStatus.ts`
- `src/services/transaction/transactionStore.ts`
- `src/services/transaction/transactionType.ts`

### `src/services/commands/` (19 file)

- `src/services/commands/command.ts`
- `src/services/commands/commandBus.ts`
- `src/services/commands/commandCategory.ts`
- `src/services/commands/commandContext.ts`
- `src/services/commands/commandDispatcher.ts`
- `src/services/commands/commandHandler.ts`
- `src/services/commands/commandManager.ts`
- `src/services/commands/commandMetadata.ts`
- `src/services/commands/commandMiddleware.ts`
- `src/services/commands/commandNormalizer.ts`
- `src/services/commands/commandPayload.ts`
- `src/services/commands/commandPriority.ts`
- `src/services/commands/commandQueue.ts`
- `src/services/commands/commandRegistry.ts`
- `src/services/commands/commandResult.ts`
- `src/services/commands/commandSerializer.ts`
- `src/services/commands/commandStatus.ts`
- `src/services/commands/commandType.ts`
- `src/services/commands/index.ts`

### `src/services/portfolio/` (17 file)

- `src/services/portfolio/balance/balanceManager.ts`
- `src/services/portfolio/balance/index.ts`
- `src/services/portfolio/index.ts`
- `src/services/portfolio/manager.ts`
- `src/services/portfolio/performance/drawdown.ts`
- `src/services/portfolio/performance/equityCurve.ts`
- `src/services/portfolio/performance/index.ts`
- `src/services/portfolio/performance/metrics.ts`
- `src/services/portfolio/pnl/index.ts`
- `src/services/portfolio/pnl/realizedPnL.ts`
- `src/services/portfolio/pnl/unrealizedPnL.ts`
- `src/services/portfolio/position/index.ts`
- `src/services/portfolio/position/positionCalculator.ts`
- `src/services/portfolio/position/positionManager.ts`
- `src/services/portfolio/registry.ts`
- `src/services/portfolio/tracker.ts`
- `src/services/portfolio/types.ts`

### `src/services/indicator/` (16 file)

- `src/services/indicator/index.ts`
- `src/services/indicator/manager.ts`
- `src/services/indicator/momentum/macd.ts`
- `src/services/indicator/momentum/rsi.ts`
- `src/services/indicator/momentum/stochastic.ts`
- `src/services/indicator/registry.ts`
- `src/services/indicator/signal/signalFusion.ts`
- `src/services/indicator/signal/signalGenerator.ts`
- `src/services/indicator/trend/adx.ts`
- `src/services/indicator/trend/ema.ts`
- `src/services/indicator/trend/macd.ts`
- `src/services/indicator/trend/sma.ts`
- `src/services/indicator/types.ts`
- `src/services/indicator/volatility/atr.ts`
- `src/services/indicator/volatility/bollinger.ts`
- `src/services/indicator/volume/obv.ts`

### `src/lib/validators/` (15 file)

- `src/lib/validators/api.ts`
- `src/lib/validators/config.ts`
- `src/lib/validators/env.ts`
- `src/lib/validators/index.ts`
- `src/lib/validators/market.ts`
- `src/lib/validators/number.ts`
- `src/lib/validators/order.ts`
- `src/lib/validators/pair.ts`
- `src/lib/validators/portfolio.ts`
- `src/lib/validators/risk.ts`
- `src/lib/validators/scanner.ts`
- `src/lib/validators/strategy.ts`
- `src/lib/validators/timeframe.ts`
- `src/lib/validators/trade.ts`
- `src/lib/validators/trading.ts`

### `src/services/indodax/` (14 file)

- `src/services/indodax/accountTypes.ts`
- `src/services/indodax/auth.ts`
- `src/services/indodax/balance.ts`
- `src/services/indodax/client.ts`
- `src/services/indodax/depth.ts`
- `src/services/indodax/history.js`
- `src/services/indodax/index.ts`
- `src/services/indodax/order.ts`
- `src/services/indodax/orderbook.ts`
- `src/services/indodax/parser.ts`
- `src/services/indodax/private.ts`
- `src/services/indodax/public.ts`
- `src/services/indodax/summaries.ts`
- `src/services/indodax/trades.ts`

### `src/services/runtime/` (13 file)

- `src/services/runtime/bootstrap.ts`
- `src/services/runtime/health.ts`
- `src/services/runtime/index.ts`
- `src/services/runtime/runtime.ts`
- `src/services/runtime/runtimeDiagnostics.ts`
- `src/services/runtime/runtimeEnvironment.ts`
- `src/services/runtime/runtimeFlags.ts`
- `src/services/runtime/runtimeInfo.ts`
- `src/services/runtime/runtimeInspector.ts`
- `src/services/runtime/runtimeManager.ts`
- `src/services/runtime/runtimeMetrics.ts`
- `src/services/runtime/runtimeOptimizer.ts`
- `src/services/runtime/runtimeProfile.ts`

### `src/services/cache/` (12 file)

- `src/services/cache/cacheCleaner.ts`
- `src/services/cache/cacheKeys.ts`
- `src/services/cache/cacheMetrics.ts`
- `src/services/cache/cachePolicy.ts`
- `src/services/cache/cacheStore.ts`
- `src/services/cache/distributedCache.ts`
- `src/services/cache/index.ts`
- `src/services/cache/marketCache.ts`
- `src/services/cache/memoryCache.ts`
- `src/services/cache/orderCache.ts`
- `src/services/cache/persistentCache.ts`
- `src/services/cache/strategyCache.ts`

### `src/services/monitor/` (10 file)

- `src/services/monitor/alertManager.ts`
- `src/services/monitor/diagnostic.ts`
- `src/services/monitor/latencyMonitor.ts`
- `src/services/monitor/memoryMonitor.ts`
- `src/services/monitor/notification.ts`
- `src/services/monitor/performanceMonitor.ts`
- `src/services/monitor/processMonitor.ts`
- `src/services/monitor/schedulerMonitor.ts`
- `src/services/monitor/systemReport.ts`
- `src/services/monitor/uptime.ts`

### `src/services/network/` (10 file)

- `src/services/network/bandwidthMonitor.ts`
- `src/services/network/connectionPool.ts`
- `src/services/network/dnsResolver.ts`
- `src/services/network/index.ts`
- `src/services/network/latencyMonitor.ts`
- `src/services/network/networkHealth.ts`
- `src/services/network/networkManager.ts`
- `src/services/network/networkMetrics.ts`
- `src/services/network/proxyManager.ts`
- `src/services/network/retryPolicy.ts`

### `src/services/plugins/` (10 file)

- `src/services/plugins/index.ts`
- `src/services/plugins/plugin.ts`
- `src/services/plugins/pluginContext.ts`
- `src/services/plugins/pluginLifecycle.ts`
- `src/services/plugins/pluginLoader.ts`
- `src/services/plugins/pluginManager.ts`
- `src/services/plugins/pluginManifest.ts`
- `src/services/plugins/pluginRegistry.ts`
- `src/services/plugins/pluginSandbox.ts`
- `src/services/plugins/pluginValidator.ts`

### `src/services/security/` (10 file)

- `src/services/security/apiGuard.ts`
- `src/services/security/auditLogger.ts`
- `src/services/security/authGuard.ts`
- `src/services/security/csrfGuard.ts`
- `src/services/security/ipGuard.ts`
- `src/services/security/permission.ts`
- `src/services/security/rateLimiter.ts`
- `src/services/security/secretManager.ts`
- `src/services/security/signature.ts`
- `src/services/security/tokenManager.ts`

### `src/services/automation/` (9 file)

- `src/services/automation/dispatcher.ts`
- `src/services/automation/engine.ts`
- `src/services/automation/health.ts`
- `src/services/automation/index.ts`
- `src/services/automation/lifecycle.ts`
- `src/services/automation/monitor.ts`
- `src/services/automation/queue.ts`
- `src/services/automation/scheduler.ts`
- `src/services/automation/worker.ts`

### `src/services/configuration/` (9 file)

- `src/services/configuration/configLoader.ts`
- `src/services/configuration/configManager.ts`
- `src/services/configuration/configProfile.ts`
- `src/services/configuration/configSchema.ts`
- `src/services/configuration/configValidator.ts`
- `src/services/configuration/configVersion.ts`
- `src/services/configuration/configWatcher.ts`
- `src/services/configuration/featureFlags.ts`
- `src/services/configuration/index.ts`

### `src/services/diagnostics/` (9 file)

- `src/services/diagnostics/diagnosticsAnalyzer.ts`
- `src/services/diagnostics/diagnosticsCollector.ts`
- `src/services/diagnostics/diagnosticsExporter.ts`
- `src/services/diagnostics/diagnosticsManager.ts`
- `src/services/diagnostics/diagnosticsReader.ts`
- `src/services/diagnostics/diagnosticsReport.ts`
- `src/services/diagnostics/diagnosticsSnapshot.ts`
- `src/services/diagnostics/diagnosticsStorage.ts`
- `src/services/diagnostics/index.ts`

### `src/services/pipeline/` (9 file)

- `src/services/pipeline/index.ts`
- `src/services/pipeline/pipeline.ts`
- `src/services/pipeline/pipelineBuilder.ts`
- `src/services/pipeline/pipelineContext.ts`
- `src/services/pipeline/pipelineExecutor.ts`
- `src/services/pipeline/pipelineManager.ts`
- `src/services/pipeline/pipelineRegistry.ts`
- `src/services/pipeline/pipelineResult.ts`
- `src/services/pipeline/pipelineStage.ts`

### `src/services/resilience/` (9 file)

- `src/services/resilience/index.ts`
- `src/services/resilience/recoveryContext.ts`
- `src/services/resilience/recoveryManager.ts`
- `src/services/resilience/recoveryPolicy.ts`
- `src/services/resilience/resilienceManager.ts`
- `src/services/resilience/retryContext.ts`
- `src/services/resilience/retryFactory.ts`
- `src/services/resilience/retryManager.ts`
- `src/services/resilience/retryRegistry.ts`

### `src/services/telemetry/` (9 file)

- `src/services/telemetry/index.ts`
- `src/services/telemetry/telemetryBuffer.ts`
- `src/services/telemetry/telemetryCollector.ts`
- `src/services/telemetry/telemetryExporter.ts`
- `src/services/telemetry/telemetryManager.ts`
- `src/services/telemetry/telemetryProcessor.ts`
- `src/services/telemetry/telemetrySnapshot.ts`
- `src/services/telemetry/telemetryStorage.ts`
- `src/services/telemetry/telemetryUploader.ts`

### `src/services/validation/` (9 file)

- `src/services/validation/arrayValidator.ts`
- `src/services/validation/index.ts`
- `src/services/validation/objectValidator.ts`
- `src/services/validation/primitiveValidator.ts`
- `src/services/validation/validationFactory.ts`
- `src/services/validation/validationManager.ts`
- `src/services/validation/validationPipeline.ts`
- `src/services/validation/validationRegistry.ts`
- `src/services/validation/validationRule.ts`

### `src/api/bot/` (8 file)

- `src/api/bot/execution.ts`
- `src/api/bot/health.ts`
- `src/api/bot/market.ts`
- `src/api/bot/portfolio.ts`
- `src/api/bot/risk.ts`
- `src/api/bot/state.ts`
- `src/api/bot/strategy.ts`
- `src/api/bot/types.ts`

### `src/services/observability/` (8 file)

- `src/services/observability/correlation.ts`
- `src/services/observability/index.ts`
- `src/services/observability/profiler.ts`
- `src/services/observability/profilerReport.ts`
- `src/services/observability/span.ts`
- `src/services/observability/traceContext.ts`
- `src/services/observability/traceExporter.ts`
- `src/services/observability/tracing.ts`

### `src/services/scheduler/` (8 file)

- `src/services/scheduler/heartbeat.ts`
- `src/services/scheduler/index.ts`
- `src/services/scheduler/intervalScheduler.ts`
- `src/services/scheduler/schedulerPersistence.ts`
- `src/services/scheduler/schedulerPolicy.ts`
- `src/services/scheduler/schedulerQueue.ts`
- `src/services/scheduler/schedulerRecovery.ts`
- `src/services/scheduler/schedulerStatistics.ts`

### `src/services/discovery/` (7 file)

- `src/services/discovery/index.ts`
- `src/services/discovery/serviceDiscovery.ts`
- `src/services/discovery/serviceHealth.ts`
- `src/services/discovery/serviceHeartbeat.ts`
- `src/services/discovery/serviceMetadata.ts`
- `src/services/discovery/serviceRegistry.ts`
- `src/services/discovery/serviceResolver.ts`

### `src/services/metrics/` (7 file)

- `src/services/metrics/applicationMetrics.ts`
- `src/services/metrics/exchangeMetrics.ts`
- `src/services/metrics/metricsCollector.ts`
- `src/services/metrics/performanceMetrics.ts`
- `src/services/metrics/processMetrics.ts`
- `src/services/metrics/schedulerMetrics.ts`
- `src/services/metrics/tradingMetrics.ts`

### `src/services/middleware/` (7 file)

- `src/services/middleware/authMiddleware.ts`
- `src/services/middleware/corsMiddleware.ts`
- `src/services/middleware/errorMiddleware.ts`
- `src/services/middleware/loggingMiddleware.ts`
- `src/services/middleware/maintenanceMiddleware.ts`
- `src/services/middleware/metricsMiddleware.ts`
- `src/services/middleware/requestIdMiddleware.ts`

### `src/services/recovery/` (7 file)

- `src/services/recovery/autoRecovery.ts`
- `src/services/recovery/emergencyShutdown.ts`
- `src/services/recovery/recoveryManager.ts`
- `src/services/recovery/recoveryState.ts`
- `src/services/recovery/restartManager.ts`
- `src/services/recovery/stateRecovery.ts`
- `src/services/recovery/watchdog.ts`

### `src/services/bootstrap/` (6 file)

- `src/services/bootstrap/application.ts`
- `src/services/bootstrap/bootstrap.ts`
- `src/services/bootstrap/dependencyContainer.ts`
- `src/services/bootstrap/lifecycle.ts`
- `src/services/bootstrap/serviceRegistry.ts`
- `src/services/bootstrap/startup.ts`

### `src/services/core/` (6 file)

- `src/services/core/applicationContext.ts`
- `src/services/core/health.ts`
- `src/services/core/kernel.ts`
- `src/services/core/metadata.ts`
- `src/services/core/shutdown.ts`
- `src/services/core/version.ts`

### `src/services/serialization/` (6 file)

- `src/services/serialization/binarySerializer.ts`
- `src/services/serialization/compression.ts`
- `src/services/serialization/encryptionSerializer.ts`
- `src/services/serialization/index.ts`
- `src/services/serialization/jsonSerializer.ts`
- `src/services/serialization/serializer.ts`

### `src/services/trading/` (6 file)

- `src/services/trading/executor.ts`
- `src/services/trading/history.ts`
- `src/services/trading/index.ts`
- `src/services/trading/portfolio.ts`
- `src/services/trading/position.ts`
- `src/services/trading/strategy.ts`

### `src/services/analytics/` (5 file)

- `src/services/analytics/analyticsEngine.ts`
- `src/services/analytics/performanceAnalytics.ts`
- `src/services/analytics/portfolioAnalytics.ts`
- `src/services/analytics/strategyAnalytics.ts`
- `src/services/analytics/tradingAnalytics.ts`

### `src/services/jobs/` (5 file)

- `src/services/jobs/cleanupJob.ts`
- `src/services/jobs/heartbeatJob.ts`
- `src/services/jobs/metricsJob.ts`
- `src/services/jobs/optimizationJob.ts`
- `src/services/jobs/reportJob.ts`

### `src/services/logger/` (5 file)

- `src/services/logger/consoleLogger.ts`
- `src/services/logger/fileLogger.ts`
- `src/services/logger/logRotation.ts`
- `src/services/logger/logger.ts`
- `src/services/logger/remoteLogger.ts`

### `src/services/maintenance/` (5 file)

- `src/services/maintenance/cleanup.ts`
- `src/services/maintenance/databaseMaintenance.ts`
- `src/services/maintenance/maintenanceManager.ts`
- `src/services/maintenance/optimize.ts`
- `src/services/maintenance/versionChecker.ts`

### `src/services/persistence/` (5 file)

- `src/services/persistence/executionRecord.ts`
- `src/services/persistence/executionRepository.ts`
- `src/services/persistence/orderRepository.ts`
- `src/services/persistence/persistenceManager.ts`
- `src/services/persistence/positionRepository.ts`

### `src/services/safety/` (5 file)

- `src/services/safety/safetyConfig.ts`
- `src/services/safety/safetyContext.ts`
- `src/services/safety/safetyDecision.ts`
- `src/services/safety/safetyGate.ts`
- `src/services/safety/safetyManager.ts`

### `src/services/strategy/` (5 file)

- `src/services/strategy/engine.ts`
- `src/services/strategy/registry.ts`
- `src/services/strategy/rules/trendRule.ts`
- `src/services/strategy/rules/volumeRule.ts`
- `src/services/strategy/scoring/confidence.ts`

### `src/lib/error/` (4 file)

- `src/lib/error/ApiError.ts`
- `src/lib/error/AppError.ts`
- `src/lib/error/Logger.ts`
- `src/lib/error/Response.ts`

### `src/services/audit/` (4 file)

- `src/services/audit/auditEvent.ts`
- `src/services/audit/auditLogger.ts`
- `src/services/audit/auditRepository.ts`
- `src/services/audit/auditSerializer.ts`

### `src/api/webhook/` (3 file)

- `src/api/webhook/constants.ts`
- `src/api/webhook/signature.ts`
- `src/api/webhook/validator.ts`

### `src/services/indicators/` (2 file)

- `src/services/indicators/bollinger.ts`
- `src/services/indicators/utils.ts`

### `src/api/settings/` (1 file)

- `src/api/settings/constants.ts`

### `src/components/ActivityView.tsx/` (1 file)

- `src/components/ActivityView.tsx`

### `src/components/BacktestSummary.tsx/` (1 file)

- `src/components/BacktestSummary.tsx`

### `src/components/DashboardOverview.tsx/` (1 file)

- `src/components/DashboardOverview.tsx`

### `src/components/RecentActivity.tsx/` (1 file)

- `src/components/RecentActivity.tsx`

### `src/config/constants.ts/` (1 file)

- `src/config/constants.ts`

### `src/config/env.ts/` (1 file)

- `src/config/env.ts`

### `src/config/limits.ts/` (1 file)

- `src/config/limits.ts`

### `src/errors/ExchangeError.ts/` (1 file)

- `src/errors/ExchangeError.ts`

### `src/errors/TradingError.ts/` (1 file)

- `src/errors/TradingError.ts`

### `src/errors/ValidationError.ts/` (1 file)

- `src/errors/ValidationError.ts`

### `src/errors/index.ts/` (1 file)

- `src/errors/index.ts`

### `src/scripts/checkBuild.ts/` (1 file)

- `src/scripts/checkBuild.ts`

### `src/scripts/validateEnv.ts/` (1 file)

- `src/scripts/validateEnv.ts`

### `src/services/exchange/` (1 file)

- `src/services/exchange/adapters/indodaxPrivateClient.ts`

### `src/services/index.ts/` (1 file)

- `src/services/index.ts`

### `src/services/reconciliation/` (1 file)

- `src/services/reconciliation/reconciliationScheduler.ts`

### `src/utils/constants.ts/` (1 file)

- `src/utils/constants.ts`

### `src/utils/dateTime.ts/` (1 file)

- `src/utils/dateTime.ts`

### `src/utils/formatters.ts/` (1 file)

- `src/utils/formatters.ts`

### `src/utils/index.ts/` (1 file)

- `src/utils/index.ts`

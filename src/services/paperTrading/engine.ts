/**
==========================================================
AURA Trade OS
Paper Trading Engine
Version : 0.0.3 Alpha
==========================================================
*/
import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";
import { TRADING_CONFIG } from "@/config/trading";
import indodaxTickerService from "@/services/indodax/ticker";
import {
  getPaperPosition,
  getOpenPaperPositions,
  savePaperPosition,
  getPaperPortfolio,
  savePaperPortfolio,
  logPaperTrade,
} from "@/services/firebase/paperTradingStore";
import { ScannedPairResult } from "@/services/scanner/types";
import { PaperPosition } from "./types";

const STARTING_BALANCE = Number(process.env.PAPER_STARTING_BALANCE ?? 1_000_000);
const FEE_PERCENT = TRADING_CONFIG.feePercent;

export async function runPaperTradingCycle(topOpportunities: ScannedPairResult[]) {
  if (BOT_CONFIG.mode !== "paper") {
    return { skipped: true, reason: "Bot mode bukan 'paper', paper engine tidak dijalankan" };
  }

  const portfolio = await getPaperPortfolio(STARTING_BALANCE);
  const actions: string[] = [];

  // --- 1. EXIT CHECK: berdasarkan posisi yang BENAR-BENAR terbuka, bukan hasil scan hari ini ---
  const openPositions = await getOpenPaperPositions();
  let openPositionsCount = openPositions.length;

  for (const position of openPositions) {
    const ticker = await indodaxTickerService.getFormattedTicker(position.pair);
    if (!ticker) continue;

    const currentPrice = ticker.lastPrice;
    let exitReason: PaperPosition["lastExitReason"] | null = null;

    if (currentPrice <= position.stopLossPrice) exitReason = "STOP_LOSS";
    else if (currentPrice >= position.takeProfitPrice) exitReason = "TAKE_PROFIT";

    if (!exitReason) continue;

    const grossValue = position.coinAmount * currentPrice;
    const feeIdr = grossValue * (FEE_PERCENT / 100);
    const netValue = grossValue - feeIdr;
    const pnlIdr = netValue - position.entryValue;
    const pnlPercent = (pnlIdr / position.entryValue) * 100;

    portfolio.availableBalance += netValue;

    await logPaperTrade({
      pair: position.pair,
      type: "SELL",
      price: currentPrice,
      coinAmount: position.coinAmount,
      idrValue: netValue,
      feeIdr,
      pnlIdr,
      pnlPercent,
      reason: exitReason,
      executedAt: Date.now(),
    });

    await savePaperPosition({
      ...position,
      inPosition: false,
      entryPrice: 0,
      coinAmount: 0,
      entryValue: 0,
      lastExitReason: exitReason,
      lastClosedAt: Date.now(),
    });

    openPositionsCount--;
    actions.push(
      `[${position.pair}] CLOSED (${exitReason}) @ Rp${currentPrice.toLocaleString("id-ID")}, PnL: Rp${pnlIdr.toFixed(0)} (${pnlPercent.toFixed(2)}%)`
    );
  }

  // --- 2. ENTRY CHECK: dari top opportunities hasil scan, kalau slot masih tersedia ---
  for (const opp of topOpportunities) {
    if (openPositionsCount >= RISK_CONFIG.maxOpenPosition) break;

    const isBuySignal = opp.signalRecommendation === "STRONG_BUY" || opp.signalRecommendation === "BUY";
    if (!isBuySignal) continue;

    const position = await getPaperPosition(opp.pair);
    if (position.inPosition) continue; // sudah ada posisi terbuka di pair ini

    // Cooldown: cegah re-entry terlalu cepat setelah posisi di pair ini baru ditutup
    if (position.lastClosedAt && Date.now() - position.lastClosedAt < RISK_CONFIG.cooldownSeconds * 1000) {
      continue;
    }

    // Sizing: dibatasi trade amount default, max trade amount, dan max exposure % dari saldo tersedia
    const maxByExposure = portfolio.availableBalance * (RISK_CONFIG.maxExposurePercent / 100);
    const tradeAmount = Math.min(BOT_CONFIG.defaultTradeAmount, BOT_CONFIG.maxTradeAmount, maxByExposure);

    if (tradeAmount < TRADING_CONFIG.order.minimumAmount || tradeAmount > portfolio.availableBalance) {
      continue; // saldo tidak cukup atau di bawah minimum order Indodax
    }

    const entryPrice = opp.lastPrice;
    const feeIdr = tradeAmount * (FEE_PERCENT / 100);
    const netAmount = tradeAmount - feeIdr;
    const coinAmount = netAmount / entryPrice;

    portfolio.availableBalance -= tradeAmount;

    const newPosition: PaperPosition = {
      pair: opp.pair,
      inPosition: true,
      entryPrice,
      coinAmount,
      entryValue: tradeAmount,
      entryTime: Date.now(),
      stopLossPrice: entryPrice * (1 - RISK_CONFIG.stopLossPercent / 100),
      takeProfitPrice: entryPrice * (1 + RISK_CONFIG.targetProfitPercent / 100),
      updatedAt: Date.now(),
    };

    await savePaperPosition(newPosition);
    await logPaperTrade({
      pair: opp.pair,
      type: "BUY",
      price: entryPrice,
      coinAmount,
      idrValue: tradeAmount,
      feeIdr,
      executedAt: Date.now(),
    });

    openPositionsCount++;
    actions.push(`[${opp.pair}] OPENED @ Rp${entryPrice.toLocaleString("id-ID")}, amount: Rp${tradeAmount.toFixed(0)}`);
  }

  // Estimasi equity kasar (belum full mark-to-market semua posisi terbuka)
  const stillOpen = await getOpenPaperPositions();
  const openValue = stillOpen.reduce((sum, p) => sum + p.entryValue, 0);
  portfolio.equityIdr = portfolio.availableBalance + openValue;

  await savePaperPortfolio(portfolio);

  return { skipped: false, portfolio, openPositionsCount, actions };
}

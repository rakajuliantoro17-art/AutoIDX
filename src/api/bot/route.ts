/**
==========================================================
AURA Trade OS
Bot API Route
Version : 0.0.1 Alpha
==========================================================
*/

import { executeBot } from "./execute";
import { successResponse, errorResponse } from "./response";
import { logger } from "./logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {

    logger.info(
      "BOT",
      "Bot execution requested."
    );

    const result = await executeBot();

    logger.success(
      "BOT",
      "Bot execution completed.",
      result.statistics
    );

    return successResponse(
      result,
      "Bot executed successfully."
    );

  } catch (error) {

    logger.error(
      "BOT",
      "Bot execution failed.",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unknown error",
      500
    );

  }
}

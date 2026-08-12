/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 7
 * Execution Test Report
 * ==========================================================
 */

export type TestStatus =
  | "PASS"
  | "FAIL"
  | "WARNING";

export interface ExecutionTest {
  readonly name: string;
  readonly status: TestStatus;
  readonly message: string;
}

export interface ExecutionTestReport {
  readonly passed: boolean;
  readonly tests: readonly ExecutionTest[];
  readonly generatedAt: number;
}

export class ExecutionTestReportBuilder {

  build(
    tests: readonly ExecutionTest[],
  ): ExecutionTestReport {

    const hasFailure =
      tests.some(
        (test) =>
          test.status === "FAIL",
      );

    return {
      passed:
        !hasFailure,

      tests: [...tests],

      generatedAt:
        Date.now(),
    };
  }
}

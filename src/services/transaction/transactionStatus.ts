/**
==========================================================
AURA Trade OS
Transaction Status
Version : 0.0.7 Alpha
==========================================================
*/

export enum TransactionStatus {
    CREATED = "CREATED",
    VALIDATING = "VALIDATING",
    VALIDATED = "VALIDATED",
    QUEUED = "QUEUED",
    EXECUTING = "EXECUTING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    ROLLED_BACK = "ROLLED_BACK",
    EXPIRED = "EXPIRED",
}

export class LiveApproval {
  private approved = false;
  private operator?: string;
  private approvedAt?: number;

  approve(operator: string): void {
    if (!operator.trim()) throw new Error("operator is required");
    this.approved = true;
    this.operator = operator;
    this.approvedAt = Date.now();
  }

  revoke(): void {
    this.approved = false;
    this.operator = undefined;
    this.approvedAt = undefined;
  }

  isApproved(): boolean { return this.approved; }

  snapshot() {
    return Object.freeze({ approved: this.approved, operator: this.operator, approvedAt: this.approvedAt });
  }
}

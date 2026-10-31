/**
 * Pencatat durasi tahap order (diagnosis latensi). Murni dan tanpa I/O:
 * pemanggil yang memutuskan kapan melaporkan (mis. total > ambang).
 */
export class PhaseTimer {
  private marks: [string, number][] = [];
  private readonly start: number;

  constructor(now: number = Date.now()) {
    this.start = now;
    this.marks.push(["start", now]);
  }

  mark(label: string, now: number = Date.now()): void {
    this.marks.push([label, now]);
  }

  totalMs(now: number = Date.now()): number {
    return now - this.start;
  }

  /** "getClient=120ms getInfo=2300ms lock=90ms ..." (selisih antar tanda). */
  summary(): string {
    const parts: string[] = [];
    for (let i = 1; i < this.marks.length; i++) {
      parts.push(`${this.marks[i][0]}=${this.marks[i][1] - this.marks[i - 1][1]}ms`);
    }
    return parts.join(" ");
  }
}

export const SLOW_ORDER_LOG_MS = 12_000;

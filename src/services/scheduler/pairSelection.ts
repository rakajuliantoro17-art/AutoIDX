/**
 * Pemilihan pair yang diproses TradingEngine per siklus (fungsi murni).
 *
 * Aturan keselamatan: kandidat scanner HANYA boleh dieksekusi bila
 * `scannerExecution` menyala DAN `watchlistOnly` mati. Checklist Priority Pairs
 * hanya MENYEMPITKAN kandidat yang sudah boleh dieksekusi; ia tidak pernah
 * membuka gerbang itu. Sebelumnya checklist mengabaikan kedua flag.
 */
export interface PairSelectionInput {
  candidatePairs: string[];
  openPositionPairs: string[];
  watchlist: string[];
  priorityPairs: string[];
  scannerExecution: boolean;
  watchlistOnly: boolean;
}

export interface PairSelectionResult {
  pairs: string[];
  executeCandidates: boolean;
  priorityIgnored: boolean;
  skippedCandidates: string[];
}

const norm = (list: string[]) => list.map((p) => p.trim().toLowerCase()).filter(Boolean);

export function selectCyclePairs(i: PairSelectionInput): PairSelectionResult {
  const candidates = norm(i.candidatePairs);
  const open = norm(i.openPositionPairs);
  const watchlist = norm(i.watchlist);
  const priority = norm(i.priorityPairs);
  const executeCandidates = i.scannerExecution && !i.watchlistOnly;

  if (priority.length > 0 && executeCandidates) {
    const candidateSet = new Set(candidates);
    const focused = priority.filter((p) => candidateSet.has(p));
    return {
      pairs: Array.from(new Set([...open, ...focused])),
      executeCandidates,
      priorityIgnored: false,
      skippedCandidates: candidates.filter((p) => !priority.includes(p)),
    };
  }

  return {
    pairs: Array.from(new Set([...(executeCandidates ? candidates : []), ...open, ...watchlist])),
    executeCandidates,
    priorityIgnored: priority.length > 0,
    skippedCandidates: executeCandidates ? [] : candidates,
  };
}

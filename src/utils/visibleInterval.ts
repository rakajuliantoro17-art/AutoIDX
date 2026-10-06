/**
==========================================================
AURA Trade OS
Visible Interval
Version : 0.1.0 Alpha
==========================================================
setInterval yang BERHENTI saat tab browser tidak terlihat
(pindah tab / layar mati) dan langsung refresh sekali begitu
tab terlihat lagi.

Kenapa: tiap tick polling dashboard = 1 invocation fungsi
Vercel (Fluid Active CPU). Tab dashboard yang lupa ditutup
sebelumnya polling terus 24 jam.

Pemakaian:
  useEffect(() => {
    return setVisibleInterval(fetchData, 10_000);
  }, [fetchData]);
==========================================================
*/

export function setVisibleInterval(
  callback: () => void,
  ms: number
): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  let timer: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (timer === null) {
      timer = setInterval(callback, ms);
    }
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      callback();
      start();
    } else {
      stop();
    }
  };

  if (document.visibilityState === "visible") {
    start();
  }

  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    stop();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

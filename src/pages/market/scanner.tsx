/**
==========================================================
AURA Trade OS
Market Scanner (redirect)
Version : 0.0.2 Alpha

Halaman ini dulu berisi UI scanner terpisah dengan 3 pair
hardcode (BTC/ETH/SOL), tidak pernah ditautkan dari sidebar
manapun (App Router maupun Pages Router keduanya link ke
/scanner), dan tidak terhubung ke MarketScanner service asli.
Duplikasi sudah diputuskan: /scanner (App Router,
src/app/scanner/page.tsx) adalah versi kanonik - sudah
memindai SEMUA pair IDR Indodax lewat MarketScanner.
Halaman ini sekarang cuma redirect supaya URL lama tidak jadi
dead-end kalau ada yang mengaksesnya langsung.
==========================================================
*/

import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/scanner",
      permanent: false,
    },
  };
};

export default function MarketScannerRedirect() {
  return null;
}

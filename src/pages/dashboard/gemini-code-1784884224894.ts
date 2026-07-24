import Head from 'next/head';
import DashboardLayout from '@/layouts/DashboardLayout';

interface OrderHistory {
  id: string;
  type: 'BUY' | 'SELL';
  price: string;
  amount: string;
  total: string;
  timestamp: string;
  status: string;
}

export default function HistoryPage() {
  const transactions: OrderHistory[] = [
    {
      id: 'ORD-9821',
      type: 'BUY',
      price: 'Rp 1,020,000,000',
      amount: '0.00004901 BTC',
      total: 'Rp 50,000',
      timestamp: '2026-07-20 10:15:00',
      status: 'FILLED',
    },
    {
      id: 'ORD-9822',
      type: 'SELL',
      price: 'Rp 1,060,800,000',
      amount: '0.00004901 BTC',
      total: 'Rp 52,000',
      timestamp: '2026-07-21 14:30:00',
      status: 'FILLED',
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Histori Transaksi | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-xs text-gray-400 mt-1">
            Catatan transaksi eksekusi order Indodax Private API.
          </p>
        </div>

        {/* Transaction Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-gray-400 uppercase font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Total (IDR)</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-gray-300 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 text-slate-400">{tx.id}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4">{tx.price}</td>
                    <td className="p-4">{tx.amount}</td>
                    <td className="p-4">{tx.total}</td>
                    <td className="p-4 text-gray-500">{tx.timestamp}</td>
                    <td className="p-4">
                      <span className="text-emerald-400 text-[11px]">● {tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
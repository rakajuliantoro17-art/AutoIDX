/**
==========================================================
AURA Trade OS
Home
Version : 0.0.1 Alpha
==========================================================
*/

import Link from "next/link";

export default function HomePage() {

    return (

        <section className="space-y-8">

            <div className="glass p-8">

                <h1 className="text-4xl font-bold">

                    AutoIDX

                </h1>

                <p className="mt-4 text-slate-300">

                    Automated Trading Engine for Indodax

                </p>

            </div>

            <div className="grid md:grid-cols-3 gap-6">

                <Link
                    href="/dashboard"
                    className="card hover:scale-[1.02] transition"
                >
                    Dashboard
                </Link>

                <Link
                    href="/scanner"
                    className="card hover:scale-[1.02] transition"
                >
                    Market Scanner
                </Link>

                <Link
                    href="/portfolio"
                    className="card hover:scale-[1.02] transition"
                >
                    Portfolio
                </Link>

            </div>

        </section>

    );

}

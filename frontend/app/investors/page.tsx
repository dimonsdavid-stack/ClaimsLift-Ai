import React from 'react';

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Header Section */}
      <header className="relative pt-24 pb-16 px-8 text-center border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium tracking-widest uppercase text-slate-300">Confidential Investment Memorandum</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            ClaimLift AI
          </h1>
          <p className="text-2xl md:text-3xl font-light text-slate-400 max-w-2xl mx-auto">
            Autonomous Revenue Recovery Engine
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-20 px-8">
        
        {/* Executive Summary */}
        <section className="mb-24 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50"></div>
          <div className="relative bg-white/5 backdrop-blur-lg p-10 md:p-14 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <h2 className="text-3xl font-bold mb-10 text-white flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span>
              Executive Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600">The $250B Crisis</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  The U.S. healthcare system bleeds over $250 billion annually due to denied or ignored insurance claims. Traditional Revenue Cycle Management (RCM) relies on massive, error-prone human capital, crushing the margins of independent practices.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600">The Agentic AI Solution</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  ClaimLift AI acts as an autonomous digital workforce. It seamlessly ingests clearinghouse data, aggressively scrubs PHI, cross-references ICD-10 policies via advanced LLMs, and autonomously drafts hyper-accurate appeal letters for 1-click human review.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-10 text-white text-center">Year 1 Defensible Projections</h2>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-6 font-semibold text-slate-300 uppercase tracking-wider text-sm">Scenario</th>
                    <th className="p-6 font-semibold text-slate-300 uppercase tracking-wider text-sm">Win Rate Scaling</th>
                    <th className="p-6 font-semibold text-slate-300 uppercase tracking-wider text-sm">Y1 Gross Rev</th>
                    <th className="p-6 font-semibold text-slate-300 uppercase tracking-wider text-sm">Y1 Net Profit</th>
                    <th className="p-6 font-semibold text-slate-300 uppercase tracking-wider text-sm">Month 12 MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-200">Conservative (Base)</td>
                    <td className="p-6 text-slate-400">0.5% &rarr; 1.0%</td>
                    <td className="p-6 font-medium text-slate-300">$3.73M</td>
                    <td className="p-6 font-medium text-emerald-400">$3.58M</td>
                    <td className="p-6 font-medium text-slate-300">$732K</td>
                  </tr>
                  <tr className="bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors duration-200 border-l-4 border-l-indigo-500 relative">
                    <td className="p-6 font-bold text-indigo-300">Aggressive (Target)</td>
                    <td className="p-6 text-indigo-200/70">0.8% &rarr; 1.8%</td>
                    <td className="p-6 font-bold text-white text-lg">$8.33M</td>
                    <td className="p-6 font-bold text-emerald-400 text-lg">$8.01M</td>
                    <td className="p-6 font-bold text-white text-lg">$1.82M</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors duration-200">
                    <td className="p-6 font-medium text-slate-200">Maximum Forecast</td>
                    <td className="p-6 text-slate-400">1.2% &rarr; 3.0%</td>
                    <td className="p-6 font-medium text-slate-300">$20.0M</td>
                    <td className="p-6 font-medium text-emerald-400">$19.2M</td>
                    <td className="p-6 font-medium text-slate-300">$4.87M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500 text-center max-w-3xl mx-auto">
            * Operational modeling factors in B2B sales cycles (CAC: $4,500), API token costs ($0.0015/claim), and standard SaaS churn. Target gross margin: 78%.
          </p>
        </section>

        {/* Enterprise Moats */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-10 text-white text-center">Enterprise Moats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: "HIPAA Compliant",
                desc: "Strict BAA flow-down and local PHI de-identification before any LLM interaction occurs.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                id: 2,
                title: "SOC 2 Roadmap",
                desc: "Type I audit scheduled for Q3 2026. Zero-retention AI endpoint architecture.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                id: 3,
                title: "Human-in-the-Loop",
                desc: "All AI-drafted appeals require licensed biller approval before clearinghouse submission.",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((moat) => (
              <div key={moat.id} className="group relative h-full">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-lg ${moat.color}`}></div>
                <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:-translate-y-2 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${moat.color} shadow-lg`}>
                    {moat.id}
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-white">{moat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{moat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal Footer */}
        <footer className="text-center text-xs text-slate-500 border-t border-white/10 pt-10 pb-4">
          <p className="mb-3 max-w-4xl mx-auto leading-relaxed">
            <strong className="text-slate-400">FORWARD-LOOKING STATEMENTS.</strong> This document contains forward-looking statements concerning the Company’s business and financial performance. These statements are based on current expectations, assumptions, and defensible bottom-up market modeling. Actual results may differ materially.
          </p>
          <p className="mb-2">&copy; 2026 ClaimLift AI. All Rights Reserved. Strictly Confidential.</p>
          <p className="text-slate-600 mt-6">
            Engineered and Incubated by <a href="https://suitestacklabs.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">SuiteStack Labs</a>.
          </p>
        </footer>

      </main>
    </div>
  )
}

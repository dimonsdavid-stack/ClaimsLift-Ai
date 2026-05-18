import React from 'react'

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Header Section */}
      <header className="bg-[#1e293b] text-white py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">ClaimLift AI</h1>
          <p className="text-2xl font-light text-slate-300">Enterprise Revenue Recovery Engine</p>
          <div className="mt-8 inline-block px-6 py-2 border border-slate-500 rounded-full text-sm font-semibold tracking-widest uppercase text-slate-400">
            Confidential Investment Memorandum
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-16 px-8">
        
        {/* Executive Summary */}
        <section className="mb-20 bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-3xl font-bold mb-6 text-[#0f172a] border-b pb-4">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-3 text-red-600">The $250B Crisis</h3>
              <p className="text-slate-600 leading-relaxed">
                The U.S. healthcare system loses over $250 billion annually to denied or ignored insurance claims. Traditional Revenue Cycle Management (RCM) relies on massive, error-prone human capital, resulting in razor-thin margins and unrecovered revenue for independent practices.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-emerald-600">The Agentic AI Solution</h3>
              <p className="text-slate-600 leading-relaxed">
                ClaimLift AI is an enterprise-grade platform that augments human billers. It ingests clearinghouse data, scrubs PHI, cross-references ICD-10 policies via LLMs, and autonomously drafts highly accurate appeal letters for human review.
              </p>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-[#0f172a]">Year 1 Defensible Projections</h2>
          <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200">
            <table className="w-full text-left bg-white">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4 font-bold">Scenario</th>
                  <th className="p-4 font-bold">Win Rate Scaling</th>
                  <th className="p-4 font-bold">Y1 Gross Rev</th>
                  <th className="p-4 font-bold">Y1 Net Profit</th>
                  <th className="p-4 font-bold">Month 12 MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">Conservative (Base)</td>
                  <td className="p-4 text-slate-600">0.5% &rarr; 1.0%</td>
                  <td className="p-4 font-medium">$3.73M</td>
                  <td className="p-4 font-medium text-emerald-600">$3.58M</td>
                  <td className="p-4 font-medium">$732K</td>
                </tr>
                <tr className="bg-blue-50/50 hover:bg-blue-50">
                  <td className="p-4 font-bold text-blue-900">Aggressive (Target)</td>
                  <td className="p-4 text-blue-800">0.8% &rarr; 1.8%</td>
                  <td className="p-4 font-bold text-blue-900">$8.33M</td>
                  <td className="p-4 font-bold text-emerald-600">$8.01M</td>
                  <td className="p-4 font-bold text-blue-900">$1.82M</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">Maximum Forecast</td>
                  <td className="p-4 text-slate-600">1.2% &rarr; 3.0%</td>
                  <td className="p-4 font-medium">$20.0M</td>
                  <td className="p-4 font-medium text-emerald-600">$19.2M</td>
                  <td className="p-4 font-medium">$4.87M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500 italic">
            * Operational modeling factors in B2B sales cycles (CAC: $4,500), API token costs ($0.0015/claim), and standard SaaS churn. Target gross margin: 78%.
          </p>
        </section>

        {/* Enterprise Moats */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mb-6 text-xl font-bold">1</div>
            <h3 className="font-bold text-lg mb-2">HIPAA Compliant</h3>
            <p className="text-slate-600 text-sm">Strict BAA flow-down and local PHI de-identification before any LLM interaction.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg mb-6 text-xl font-bold">2</div>
            <h3 className="font-bold text-lg mb-2">SOC 2 Roadmap</h3>
            <p className="text-slate-600 text-sm">Type I audit scheduled for Q3 2026. Zero-retention AI endpoint architecture.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg mb-6 text-xl font-bold">3</div>
            <h3 className="font-bold text-lg mb-2">Human-in-the-Loop</h3>
            <p className="text-slate-600 text-sm">All AI-drafted appeals require licensed biller approval before clearinghouse submission.</p>
          </div>
        </section>

        {/* Legal Footer */}
        <footer className="text-center text-xs text-slate-400 border-t pt-8">
          <p className="mb-2"><strong>FORWARD-LOOKING STATEMENTS.</strong> This document contains forward-looking statements concerning the Company’s business and financial performance. These statements are based on current expectations, assumptions, and defensible bottom-up market modeling. Actual results may differ materially.</p>
          <p className="mb-2">&copy; 2026 ClaimLift AI. All Rights Reserved. Strictly Confidential.</p>
          <p className="text-slate-300">
            Engineered and Incubated by <a href="https://suitestacklabs.com" className="text-blue-500 hover:underline">SuiteStack Labs</a>.
          </p>
        </footer>

      </main>
    </div>
  )
}

export default function ExecutiveDashboard() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">ClaimLift Executive Dashboard</h1>
          <p className="text-muted-foreground">Internal RevOps & System Metrics</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium mb-1">Total System MRR</h3>
            <p className="text-3xl font-bold text-green-500">$8,500</p>
            <p className="text-xs text-muted-foreground mt-2">Target: $10,000 (Day 7)</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium mb-1">Qualified Pipeline</h3>
            <p className="text-3xl font-bold">$42,000</p>
            <p className="text-xs text-muted-foreground mt-2">12 Active Opportunities</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium mb-1">Total Dollars Recovered</h3>
            <p className="text-3xl font-bold text-primary">$1,250,000</p>
            <p className="text-xs text-muted-foreground mt-2">Across 8 Tenants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Agent Run Logs</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-2 border-b">
                <span>Revenue Command Agent</span>
                <span className="text-green-500">Success</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 border-b">
                <span>GTM Agent (Apollo)</span>
                <span className="text-green-500">Success</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 border-b">
                <span>Compliance Agent</span>
                <span className="text-yellow-500">Flagged 2 Outbound Emails</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 border-b">
                <span>Self-Audit Agent</span>
                <span className="text-green-500">Passed</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">GTM Engine Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Apollo API Quota (Daily)</span>
                  <span>450 / 1000</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[45%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Hunter API Quota (Monthly)</span>
                  <span>120 / 500</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-[24%]"></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm w-full">
                  Trigger Emergency Revenue Sprint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

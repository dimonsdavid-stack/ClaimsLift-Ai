import ClaimUpload from '@/components/ClaimUpload';

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">ClaimLift Command Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              Autonomy Level: Review Required
            </span>
            <button className="bg-secondary px-4 py-2 rounded-md font-medium text-sm">Settings</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Total Recovered (YTD)</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">$142,500</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Pending Appeals</h3>
            <p className="text-3xl font-bold">45</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Requires Review</h3>
            <p className="text-3xl font-bold text-orange-500">12</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Win Rate</h3>
            <p className="text-3xl font-bold text-primary">68%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Human Exception Queue</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition">
                    <div>
                      <h4 className="font-semibold">Claim #{100234 + i} • Aetna</h4>
                      <p className="text-sm text-muted-foreground">Denial: CO-16 (Lacking Information) • Value: $1,250</p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                      Review Draft
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="space-y-8">
            <ClaimUpload />
            
            <section className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4 relative border-l-2 border-muted ml-3 pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  <p className="text-sm font-medium">Appeal Won - UHC</p>
                  <p className="text-xs text-muted-foreground">Recovered $450 • 2 hrs ago</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                  <p className="text-sm font-medium">Auto-Drafted 15 Appeals</p>
                  <p className="text-xs text-muted-foreground">Awaiting your approval • 5 hrs ago</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background"></div>
                  <p className="text-sm font-medium">Ingested 835 File</p>
                  <p className="text-xs text-muted-foreground">Found 12 new underpayments • 1 day ago</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

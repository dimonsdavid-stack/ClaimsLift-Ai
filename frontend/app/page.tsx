import ROICalculator from '@/components/ROICalculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 px-4 bg-background">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
          Autonomous AI <br/><span className="text-primary">Revenue Recovery</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Find denied, delayed, underpaid, and at-risk claims. Prioritize recoverable revenue and automate appeals instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition shadow-lg">
            Start Free Leakage Audit
          </button>
          <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/80 transition border">
            Book Demo
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <ROICalculator />
      </div>
    </main>
  )
}

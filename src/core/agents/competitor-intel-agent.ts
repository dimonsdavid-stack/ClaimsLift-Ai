import { db, CompetitorWeakness, InjectedObjectionOverride, CompetitorIntelReport } from '../database';

export type { CompetitorWeakness, InjectedObjectionOverride, CompetitorIntelReport };

// Simulated competitor review data (in production: scraped via Google Reviews API / Yelp API)
const SIMULATED_COMPETITOR_INTEL: CompetitorWeakness[] = [
  {
    competitor: 'Fever-Tree',
    weaknessType: 'SHIPPING',
    discoveredText: 'Multiple bar managers on social media complaining glass bottles arrive broken in bulk shipments. High breakage claims are eating into 30% of orders for small accounts.',
    severity: 'HIGH'
  },
  {
    competitor: 'Fever-Tree',
    weaknessType: 'SHELF_LIFE',
    discoveredText: 'Buyers note Fever-Tree has a 6–9 month shelf life after opening, with carbonation loss. Waste cited as a margin killer for low-volume boutique accounts.',
    severity: 'HIGH'
  },
  {
    competitor: 'Stirrings',
    weaknessType: 'SUGAR',
    discoveredText: 'Numerous Stirrings reviews mention their products are "too sweet" and health-aware customers specifically avoid them due to high sugar content.',
    severity: 'HIGH'
  },
  {
    competitor: 'Stirrings',
    weaknessType: 'PACKAGING',
    discoveredText: 'Stirrings bottles require significant shelf footprint. Multiple small liquor shop owners note the large bottles don\'t fit on compact specialty displays.',
    severity: 'MEDIUM'
  },
  {
    competitor: 'Lava Craft Cocktail Co.',
    weaknessType: 'MARGIN',
    discoveredText: 'Craft mixer retailers and buyers report Lava Craft is pushing for exclusive agreements with heavy minimum orders ($500+), creating high upfront risk for smaller specialty accounts.',
    severity: 'HIGH'
  },
  {
    competitor: 'Powell & Mahoney',
    weaknessType: 'TASTE',
    discoveredText: 'A growing number of health-first customers note that Powell & Mahoney uses "natural flavors" and cane sugar without any sugar-free options — alienating the keto/zero-sugar market segment.',
    severity: 'MEDIUM'
  },
  {
    competitor: 'General Liquid Mixers',
    weaknessType: 'SHIPPING',
    discoveredText: 'Boutique store owners trending on wholesale buyer groups discussing frustration with glass breakage shipping costs from all liquid mixer brands. Dry alternatives gaining interest.',
    severity: 'HIGH'
  }
];

// Objection overrides generated from competitor intel
function buildObjectionOverrides(weaknesses: CompetitorWeakness[]): InjectedObjectionOverride[] {
  const overrides: InjectedObjectionOverride[] = [];

  for (const w of weaknesses) {
    if (w.weaknessType === 'SHIPPING' && w.severity === 'HIGH') {
      overrides.push({
        objectionTrigger: 'liquid mixer',
        overrideAngle: `Our intelligence shows ${w.competitor} retailers are reporting significant glass breakage losses in bulk orders. Cocktail Stix\'s dry stick-pack format eliminates ALL breakage risk and shipping damage — permanently.`,
        competitorMentioned: w.competitor
      });
    }
    if (w.weaknessType === 'SUGAR' && w.severity === 'HIGH') {
      overrides.push({
        objectionTrigger: 'already carry',
        overrideAngle: `${w.competitor} carries significant sugar content which is actively turning off today\'s health-conscious consumer. Cocktail Stix is the only zero-sugar option with a clean, non-bitter sweetener profile — capturing the customer your current mixers are losing.`,
        competitorMentioned: w.competitor
      });
    }
    if (w.weaknessType === 'MARGIN' && w.severity === 'HIGH') {
      overrides.push({
        objectionTrigger: 'budget',
        overrideAngle: `Unlike ${w.competitor} who requires $500+ minimum commitments, Cocktail Stix has no minimum order policy. Start with a single counter display and prove sell-through before scaling. Zero upfront risk.`,
        competitorMentioned: w.competitor
      });
    }
    if (w.weaknessType === 'SHELF_LIFE') {
      overrides.push({
        objectionTrigger: 'inventory',
        overrideAngle: `${w.competitor} products have shelf-life issues once opened, creating waste risk. Cocktail Stix dry packets carry a 2-year shelf life sealed, eliminating slow-moving inventory write-offs entirely.`,
        competitorMentioned: w.competitor
      });
    }
  }

  return overrides;
}

export class CompetitorIntelAgent {

  /**
   * Runs weekly competitor intelligence scraping (simulated in sandbox).
   * Identifies competitor weaknesses and injects them as override angles
   * into the Objection Handling Agent's database for use in live replies.
   */
  public static async runWeeklyIntelCycle(): Promise<CompetitorIntelReport> {
    const competitors = ['Fever-Tree', 'Stirrings', 'Lava Craft Cocktail Co.', 'Powell & Mahoney'];

    db.addLog(
      'OBJECTION',
      'COMPETITOR_INTEL_START',
      `Competitor Intelligence Agent scanning market signals for: ${competitors.join(', ')}...`,
      500
    );

    // In production: call Google Reviews API / scrape cocktail buyer forums / parse social media
    // In sandbox: use pre-loaded high-fidelity intelligence pool
    const discoveredWeaknesses = SIMULATED_COMPETITOR_INTEL.filter(w => {
      // Randomly surface a subset each cycle (simulating new discoveries)
      return Math.random() > 0.2;
    });

    // Sort by severity
    const ranked = discoveredWeaknesses.sort((a, b) => {
      const severityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityScore[b.severity] - severityScore[a.severity];
    });

    // Build override angles
    const overrides = buildObjectionOverrides(ranked);

    // Compose insight summary
    const highCount = ranked.filter(w => w.severity === 'HIGH').length;
    const insight = `Discovered ${ranked.length} competitor weaknesses (${highCount} critical). Top finding: ${ranked[0]?.discoveredText?.substring(0, 100)}... ${overrides.length} objection override angles injected into live response engine.`;

    const report: CompetitorIntelReport = {
      id: `intel-${Date.now()}`,
      timestamp: new Date().toISOString(),
      competitorsAnalyzed: competitors,
      weaknesses: ranked,
      injectedObjectionOverrides: overrides,
      insight
    };

    // Persist to database
    db.saveCompetitorIntelReport(report);

    db.addLog(
      'OBJECTION',
      'COMPETITOR_INTEL_COMPLETE',
      `🔍 Intel cycle complete. ${ranked.length} weaknesses cataloged across ${competitors.length} competitors. ${overrides.length} new override angles ready for objection handling: ${overrides.map(o => `"${o.objectionTrigger}" → ${o.competitorMentioned}`).join(' | ')}`,
      800
    );

    return report;
  }

  /**
   * Returns the current best competitor override for a given objection text.
   * Called by ObjectionAgent to enrich outbound replies with live competitor intel.
   */
  public static getOverrideForObjection(objectionText: string): InjectedObjectionOverride | null {
    const latest = db.getLatestCompetitorIntelReport();
    if (!latest) return null;

    const lowerText = objectionText.toLowerCase();
    const match = latest.injectedObjectionOverrides.find(o =>
      lowerText.includes(o.objectionTrigger.toLowerCase())
    );

    return match || null;
  }
}

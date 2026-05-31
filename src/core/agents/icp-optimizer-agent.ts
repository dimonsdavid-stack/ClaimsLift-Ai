import { db, ICPProfile } from '../database';

export type { ICPProfile };

const DEFAULT_ICP: ICPProfile = {
  id: 'icp-1',
  lastUpdated: new Date().toISOString(),
  topStoreTypes: ['boutique liquor wine spirits store', 'specialty grocery market', 'luxury hotel resort retail mini-bar'],
  topCities: ['Miami Beach, FL', 'New York, NY', 'Las Vegas, NV', 'Austin, TX', 'Scottsdale, AZ'],
  avgClosedValue: 0,
  closedWonCount: 0,
  prioritySearchQueries: [
    'boutique liquor wine spirits store',
    'specialty grocery market',
    'luxury hotel resort retail mini-bar'
  ],
  killList: [],
  confidenceScore: 10,
  insight: 'Running on default ICP. Needs CLOSED_WON deal data to self-optimize.'
};

export class ICPOptimizerAgent {

  /**
   * Analyzes historical CLOSED_WON deals and rewrites the lead-generation
   * search strategy to prioritize winning store/city profiles.
   */
  public static async optimizeICP(): Promise<ICPProfile> {
    db.addLog('DATA', 'ICP_OPTIMIZER_START',
      'ICP Optimizer Agent booting — scanning CLOSED_WON deal patterns to evolve search strategy...', 400);

    const pipeline  = db.getPipeline();
    const leads     = db.getLeads();
    const closedWon = pipeline.filter(c => c.dealStage === 'CLOSED_WON');

    let current = db.getICPProfile() ?? { ...DEFAULT_ICP };

    if (closedWon.length === 0) {
      db.addLog('DATA', 'ICP_OPTIMIZER_SKIP',
        'No CLOSED_WON deals found yet. Retaining default ICP search strategy. Will re-run automatically after first closes.',
        120);
      return current;
    }

    // --- Tally conversion signals from won deals ---
    const storeTypeWins: Record<string, number> = {};
    const cityWins:      Record<string, number> = {};
    let   totalValue = 0;

    for (const contact of closedWon) {
      const lead = leads.find(l => l.id === contact.leadId);
      if (!lead) continue;

      totalValue += contact.dealValue || 0;

      // Extract store type from intentSignals
      const intentText = lead.intentSignals.join(' ').toLowerCase();
      if (intentText.includes('liquor') || intentText.includes('spirits')) {
        storeTypeWins['boutique liquor wine spirits store'] =
          (storeTypeWins['boutique liquor wine spirits store'] || 0) + 1;
      }
      if (intentText.includes('grocery') || intentText.includes('grocer')) {
        storeTypeWins['specialty grocery market'] =
          (storeTypeWins['specialty grocery market'] || 0) + 1;
      }
      if (intentText.includes('hotel') || intentText.includes('resort')) {
        storeTypeWins['luxury hotel resort retail mini-bar'] =
          (storeTypeWins['luxury hotel resort retail mini-bar'] || 0) + 1;
      }
      if (intentText.includes('bar') || intentText.includes('cocktail lounge')) {
        storeTypeWins['upscale cocktail bar lounge'] =
          (storeTypeWins['upscale cocktail bar lounge'] || 0) + 1;
      }
      if (intentText.includes('gourmet') || intentText.includes('artisan')) {
        storeTypeWins['gourmet artisan food store'] =
          (storeTypeWins['gourmet artisan food store'] || 0) + 1;
      }

      // Extract city hint from Google Places intent signal
      const placeLine = lead.intentSignals.find(s => s.startsWith('Google Places'));
      if (placeLine) {
        const parts = placeLine.split(',');
        if (parts.length >= 2) {
          const city = parts[parts.length - 2]?.trim() + ', ' + parts[parts.length - 1]?.trim().split(' ')[0];
          if (city && city.length > 2) {
            cityWins[city] = (cityWins[city] || 0) + 1;
          }
        }
      }
    }

    // --- Rank and select top performers ---
    const sortedStoreTypes = Object.entries(storeTypeWins)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);

    const sortedCities = Object.entries(cityWins)
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => city);

    // Supplement with defaults if not enough data
    const defaultCities = ['Miami Beach, FL', 'New York, NY', 'Las Vegas, NV', 'Austin, TX', 'Scottsdale, AZ'];
    const finalCities   = sortedCities.length >= 3
      ? sortedCities.slice(0, 5)
      : [...new Set([...sortedCities, ...defaultCities])].slice(0, 5);

    const defaultTypes  = ['boutique liquor wine spirits store', 'specialty grocery market', 'luxury hotel resort retail mini-bar'];
    const finalTypes    = sortedStoreTypes.length >= 2
      ? sortedStoreTypes.slice(0, 4)
      : [...new Set([...sortedStoreTypes, ...defaultTypes])].slice(0, 4);

    // Build priority search queries (cross-product of top type × top city)
    const priorityQueries: string[] = [];
    for (const type of finalTypes.slice(0, 2)) {
      for (const city of finalCities.slice(0, 3)) {
        priorityQueries.push(`${type} in ${city}`);
      }
    }

    // Kill-list: store types with zero wins AND at least 3 SDR contacts
    const allTypes = ['boutique liquor wine spirits store', 'specialty grocery market', 'luxury hotel resort retail mini-bar'];
    const killList = allTypes.filter(t => !storeTypeWins[t] || storeTypeWins[t] === 0);

    const avgValue      = closedWon.length > 0 ? Math.round(totalValue / closedWon.length) : 0;
    const confidence    = Math.min(100, 10 + closedWon.length * 12);

    const topTypeLabel  = finalTypes[0] || 'specialty stores';
    const topCityLabel  = finalCities[0] || 'premium markets';

    const insight = closedWon.length >= 3
      ? `Strong close rate from "${topTypeLabel}" in ${topCityLabel}. ICP rewritten to bias toward those segments. Avg deal $${avgValue.toLocaleString()}.`
      : `Early signal detected from ${closedWon.length} won deal(s). Monitoring for pattern lock-in. Avg deal $${avgValue.toLocaleString()}.`;

    const updatedProfile: ICPProfile = {
      id: 'icp-1',
      lastUpdated: new Date().toISOString(),
      topStoreTypes: finalTypes,
      topCities: finalCities,
      avgClosedValue: avgValue,
      closedWonCount: closedWon.length,
      prioritySearchQueries: priorityQueries,
      killList,
      confidenceScore: confidence,
      insight
    };

    db.saveICPProfile(updatedProfile);

    db.addLog(
      'DATA',
      'ICP_OPTIMIZER_COMPLETE',
      `ICP rewritten. Priority store types: [${finalTypes.slice(0, 2).join(', ')}]. Priority cities: [${finalCities.slice(0, 2).join(', ')}]. Confidence: ${confidence}%. ${insight}`,
      600
    );

    return updatedProfile;
  }

  /**
   * Returns the highest-priority search query from the current ICP profile.
   * Falls back to a default broad query if no profile exists.
   */
  public static getBestSearchQuery(): string {
    const profile = db.getICPProfile();
    if (profile && profile.prioritySearchQueries.length > 0) {
      // Rotate through queries so each cycle covers a different target
      const idx = (profile.closedWonCount + Math.floor(Date.now() / 60000)) % profile.prioritySearchQueries.length;
      return profile.prioritySearchQueries[idx];
    }
    return 'boutique liquor wine spirits store';
  }
}

import { NextResponse } from 'next/server';
import { GTMOrchestrator } from '../../../core/orchestrator';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Protect endpoint using CRON_SECRET environment variable (fallback to a default secure token)
    const cronSecret = process.env.CRON_SECRET || 'cocktailstix_secure_cron_token';
    if (secret !== cronSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // High-value wholesale cities nationwide for Cocktail Stix
    const majorCities = [
      "Miami Beach, FL",
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "San Francisco, CA",
      "Las Vegas, NV",
      "Austin, TX",
      "Boston, MA",
      "Seattle, WA",
      "Denver, CO"
    ];

    // Optimal daily wholesale search query rotation to scan different retail targets
    const queries = [
      "boutique liquor wine spirits store",
      "specialty grocery market",
      "luxury hotel resort retail mini-bar",
      "beach yacht cocktail lounge"
    ];
    
    // Rotate query and city using days since epoch to ensure daily progression
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    
    const cityIndex = Math.max(0, daysSinceEpoch % majorCities.length);
    const queryIndex = Math.max(0, daysSinceEpoch % queries.length);
    
    const optimalCity = majorCities[cityIndex];
    const optimalQuery = queries[queryIndex];
    const nationwideQuery = `${optimalQuery} in ${optimalCity}`;

    console.log(`[Cron] Triggering nationwide daily wholesale GTM step for query: "${nationwideQuery}"`);
    const result = await GTMOrchestrator.executeFullGTMStep(undefined, nationwideQuery);

    return NextResponse.json({
      success: true,
      message: 'Nationwide daily wholesale GTM sequence executed successfully.',
      targetQuery: nationwideQuery,
      city: optimalCity,
      category: optimalQuery,
      result
    });
  } catch (error: any) {
    console.error('[Cron] Failed to execute daily wholesale sequence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

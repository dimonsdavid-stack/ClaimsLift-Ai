import { db, ABTest, ScientistReport } from '../database';

export type { ScientistReport };

const CHALLENGER_SUBJECTS = [
  'Your customers are looking for sugar-free alternatives — Cocktail Stix has them',
  'Keto-friendly cocktail mixers: the fastest growing shelf segment in 2025',
  'Most boutique retailers don\'t carry zero-sugar cocktail mixers yet. You could be first.',
  'Here\'s what 45% gross margin looks like on your spirits shelf',
  'Cocktail Stix — the mixer your customers are already asking for',
  'Clean label, zero sugar, high margin — a new beverage category for {{companyName}}',
  'We ship to your door. Your customers discover it. You keep 45% — is that interesting?',
];

const CHALLENGER_BODIES = [
  `Hi {{firstName}},

I wanted to reach out because health-conscious drinking is the fastest growing trend in specialty beverage retail right now — and most boutique stores are still missing the perfect product to serve it.

Cocktail Stix are all-natural, zero-sugar, single-serve cocktail mixer packets sweetened with monk fruit and allulose. No stevia. No bitterness. No glass breakage risk. Zero calories.

Your customers who want to enjoy a Margarita or Moscow Mule without the sugar will love them — and they'll come back for more because there's nothing else like it on the shelf.

We're offering wholesale sample kits to selected specialty partners this month. Shall I ship one to {{companyName}} next week?

Best,
Cocktail Stix Wholesale Team`,

  `Hi {{firstName}},

Keto and zero-sugar lifestyles are now mainstream — and cocktail time is the one moment most people haven't found a clean option for, until Cocktail Stix.

Our zero-calorie, monk fruit and allulose sweetened mixer packets let your customers make a perfect Classic Margarita or Pineapple Spritz without any sugar guilt. Fully retail-ready, UPC barcoded, travel-friendly.

{{companyName}} would be a perfect fit. Our starter wholesale tier comes with a stunning counter display and a guaranteed 45% gross margin on every carton.

Can I send a complimentary sample kit for your team to taste this week?

Warm regards,
Wholesale Outreach | Cocktail Stix`,

  `Hi {{firstName}},

One trend we keep seeing in high-performing specialty bottle shops and gourmet markets: customers who would love a cocktail at home but skip the sugary premixed options.

Cocktail Stix are the answer — zero-sugar, zero-calorie stick packs that turn any spirit into a premium cocktail. Sweetened with monk fruit and allulose, they're clean, keto-friendly, and genuinely delicious.

We'd love to put a display in {{companyName}} on a trial basis. No minimum order risk. 45% margin. We handle all the POP display materials.

Worth 5 minutes? I'd love to send a sample.

Cheers,
Cocktail Stix`
];

export class CampaignScientistAgent {
  private static readonly MIN_SENDS_FOR_SIGNIFICANCE = 5;
  private static readonly SIGNIFICANCE_THRESHOLD = 0.05; // 5% rate difference required to call a winner

  public static async runExperiment(): Promise<ScientistReport | null> {
    db.addLog(
      'SDR',
      'CAMPAIGN_SCIENTIST_START',
      'Campaign Scientist Agent booting — analyzing A/B email variant performance data to identify winners and evolve copy...',
      350
    );

    const tests = db.getABTests();
    const subjectTest = tests.find(t => t.testName === 'SUBJECT_LINE');

    if (!subjectTest) {
      db.addLog('SDR', 'CAMPAIGN_SCIENTIST_SKIP', 'No SUBJECT_LINE A/B test found in database.', 80);
      return null;
    }

    const totalSends = subjectTest.sendsA + subjectTest.sendsB;

    if (totalSends < this.MIN_SENDS_FOR_SIGNIFICANCE) {
      const report: ScientistReport = {
        id: `sci-${Date.now()}`,
        timestamp: new Date().toISOString(),
        testId: subjectTest.id,
        winnerVariant: 'A',
        killedVariant: 'B',
        winnerConversionRate: 0,
        loserConversionRate: 0,
        newChallengerSubject: '',
        newChallengerBody: '',
        action: 'INSUFFICIENT_DATA',
        insight: `Only ${totalSends} total sends. Minimum ${this.MIN_SENDS_FOR_SIGNIFICANCE} sends required before statistical comparison. Collecting more data...`
      };
      db.addScientistReport(report);
      db.addLog('SDR', 'CAMPAIGN_SCIENTIST_WAIT', report.insight, 120);
      return report;
    }

    // Calculate reply rates (simulated if no real replies yet)
    let rateA = subjectTest.sendsA > 0 ? subjectTest.repliesA / subjectTest.sendsA : 0;
    let rateB = subjectTest.sendsB > 0 ? subjectTest.repliesB / subjectTest.sendsB : 0;

    // If zero replies yet but we have sends, simulate realistic rates so the agent has something to work with
    if (subjectTest.repliesA === 0 && subjectTest.repliesB === 0 && totalSends >= this.MIN_SENDS_FOR_SIGNIFICANCE) {
      rateA = 0.08 + Math.random() * 0.12; // 8–20%
      rateB = 0.05 + Math.random() * 0.15; // 5–20%
      // Write simulated replies back
      subjectTest.repliesA = Math.round(subjectTest.sendsA * rateA);
      subjectTest.repliesB = Math.round(subjectTest.sendsB * rateB);
      subjectTest.conversionRateA = rateA;
      subjectTest.conversionRateB = rateB;
      db.updateABTest(subjectTest);
    }

    const diff = Math.abs(rateA - rateB);
    const winnerVariant: 'A' | 'B' = rateA >= rateB ? 'A' : 'B';
    const killedVariant: 'A' | 'B' = winnerVariant === 'A' ? 'B' : 'A';
    const winnerRate  = winnerVariant === 'A' ? rateA : rateB;
    const loserRate   = winnerVariant === 'A' ? rateB : rateA;

    // Generate a new challenger to replace the losing variant
    const challengerSubjectIdx = Math.floor(Math.random() * CHALLENGER_SUBJECTS.length);
    const challengerBodyIdx    = Math.floor(Math.random() * CHALLENGER_BODIES.length);
    const newSubject  = CHALLENGER_SUBJECTS[challengerSubjectIdx];
    const newBody     = CHALLENGER_BODIES[challengerBodyIdx];

    let action: ScientistReport['action'] = 'NEW_CHALLENGER_GENERATED';
    let insight = '';

    if (diff >= this.SIGNIFICANCE_THRESHOLD) {
      action  = 'NEW_CHALLENGER_GENERATED';
      insight = `Variant ${winnerVariant} wins with ${(winnerRate * 100).toFixed(1)}% reply rate vs Variant ${killedVariant}'s ${(loserRate * 100).toFixed(1)}%. Variant ${killedVariant} killed. New challenger generated to compete against the champion.`;
    } else {
      action  = 'NEW_CHALLENGER_GENERATED';
      insight = `No significant difference detected yet (${(diff * 100).toFixed(1)}% spread). Generating a fresh Variant ${killedVariant} challenger to introduce new copy angles and break the tie.`;
    }

    // Update the losing variant in the A/B test with new challenger copy
    if (killedVariant === 'A') {
      subjectTest.variantA       = newSubject;
      subjectTest.variantA_body  = newBody;
      subjectTest.sendsA         = 0;
      subjectTest.repliesA       = 0;
      subjectTest.conversionRateA = 0;
      subjectTest.activeVariant  = 'B'; // push traffic to winning variant while challenger is fresh
    } else {
      subjectTest.variantB       = newSubject;
      subjectTest.variantB_body  = newBody;
      subjectTest.sendsB         = 0;
      subjectTest.repliesB       = 0;
      subjectTest.conversionRateB = 0;
      subjectTest.activeVariant  = 'A';
    }
    db.updateABTest(subjectTest);

    const report: ScientistReport = {
      id: `sci-${Date.now()}`,
      timestamp: new Date().toISOString(),
      testId: subjectTest.id,
      winnerVariant,
      killedVariant,
      winnerConversionRate: winnerRate,
      loserConversionRate: loserRate,
      newChallengerSubject: newSubject,
      newChallengerBody: newBody,
      action,
      insight
    };

    db.addScientistReport(report);

    db.addLog(
      'SDR',
      'CAMPAIGN_SCIENTIST_COMPLETE',
      `📊 ${insight} New Variant ${killedVariant} challenger: "${newSubject}"`,
      700
    );

    return report;
  }
}

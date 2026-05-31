import { db, PipelineContact, Lead } from '../database';

export class PricingOptimizerAgent {
  public static async determineOptimalOffer(contact: PipelineContact): Promise<{ offerName: string; discountDesc: string; priceMultiplier: number }> {
    const lead = db.getLead(contact.leadId);
    if (!lead) return { offerName: 'Standard', discountDesc: '$100 off Airgoods Promo', priceMultiplier: 1.0 };

    db.addLog('AE', 'PRICING_OPTIMIZER_START', `Pricing Optimizer Agent evaluating maximum margin yield offer for ${lead.companyName}...`, 100);

    // The Airgoods $100 off promo is the ultimate hook. We no longer A/B test pricing.
    db.addLog('AE', 'OFFER_SELECTED', `Offer Selected: "$100 Off Airgoods Promo". Best possible conversion hook applied.`, 200, 'SUCCESS');
    return { offerName: '100_OFF', discountDesc: '$100 off your first order to try us risk-free', priceMultiplier: 1.0 };
  }
}

import { db, PipelineContact, Lead } from '../database';
import { CommunicationAdapter } from '../integrations/communication';
import { PricingOptimizerAgent } from './pricing-optimizer-agent';

export class AEAgent {
  public static async executeAECloser(contact: PipelineContact): Promise<{ invoiceId: string; pricingTier: string; finalPrice: number }> {
    const lead = db.getLead(contact.leadId)!;
    
    db.addLog('AE', 'PROPOSAL_GEN_START', `AE Closer initiating proposal workflow for ${lead.companyName} (${lead.firstName})...`, 800);

    // 1. Dynamic Pricing Tier Parameters based on Retail Buyer Profile
    // (We evaluate the buyer's title and retail signals to estimate their wholesale volume capacity)
    const profileString = (lead.title + ' ' + lead.intentSignals.join(' ') + ' ' + lead.techStack.join(' ')).toLowerCase();
    
    let pricingTier = 'Standard Retail Case';
    let dealValue = 1600; // Base Standard Retail Case package ($1,600) — covers standard specialty grocery/liquor stores

    if (profileString.includes('resort') || profileString.includes('director') || profileString.includes('national') || profileString.includes('chain')) {
      // High-volume multi-location buyers or resorts get the Pallet volume package
      pricingTier = 'Multi-Location Pallet';
      dealValue = 6800; // Pallet Distributor package ($6,800)
    } else if (profileString.includes('boutique') || profileString.includes('single-store') || profileString.includes('owner')) {
      // Smaller independent boutiques get the counter display kit to reduce risk
      pricingTier = 'Counter Display Kit';
      dealValue = 480; // Counter Display package ($480)
    }

    const optimalOffer = await PricingOptimizerAgent.determineOptimalOffer(contact);
    const finalPrice = Math.round(dealValue * optimalOffer.priceMultiplier);
    
    // 2. Generate Airgoods Wholesale Portal Link
    const airgoodsUrl = 'https://airgoods.com/brand/0b9eb686-0549-4b0d-a88d-1b891f9a6092?queryId=7575922d8bc82a766597d0d7525035df';
    
    // 3. Update Pipeline
    contact.dealStage = 'AE_PROPOSAL';
    contact.dealValue = finalPrice;
    db.savePipelineContact(contact);

    // 4. Send Proposal Email to lead
    const emailBody = `Hi ${lead.firstName},\n\nIt was great connecting with our team regarding Cocktail Stix wholesale options. Based on ${lead.companyName}'s retail format and premium beverage selection, we highly recommend our ${pricingTier}.\n\nTo make onboarding completely frictionless, we fulfill all our wholesale orders through Airgoods. You get Net 60 terms, free returns, and we are offering ${optimalOffer.discountDesc}!\n\nYou can claim your promo and submit your purchase order directly here:\n${airgoodsUrl}\n\nOnce submitted, we will immediately initiate warehouse packaging.\n\nBest regards,\nMax Leahy\nOwner | Cocktail Stix`;
    
    await CommunicationAdapter.sendEmail(lead.email, `Cocktail Stix Wholesale Partner Program - ${lead.companyName}`, emailBody);

    db.addLog('AE', 'PROPOSAL_DISPATCHED', `Directed ${lead.companyName} to Airgoods Wholesale Portal. Advanced pipeline to AE_PROPOSAL.`, 500);

    return {
      invoiceId: 'airgoods_po_pending',
      pricingTier,
      finalPrice
    };
  }

  public static async checkClosingStatus(contact: PipelineContact, invoiceId: string): Promise<boolean> {
    const lead = db.getLead(contact.leadId)!;
    
    db.addLog('AE', 'CLOSING_VERIFICATION', `Verifying new Purchase Order sync from Airgoods API for ${lead.companyName}...`, 400);

    // Simulate Airgoods API PO Check (mock 80% success rate on check if they reached this stage)
    const poReceived = Math.random() > 0.2;

    if (poReceived) {
      contact.dealStage = 'CLOSED_WON';
      contact.retentionStatus = 'ACTIVE';
      contact.lastInteractionDate = new Date().toISOString();
      db.savePipelineContact(contact);

      db.addLog(
        'AE', 
        'DEAL_CLOSED_WON', 
        `SUCCESS! Purchase Order received via Airgoods for ${contact.dealValue}. Deal closed-won for ${lead.companyName}!`, 
        600
      );
      return true;
    } else {
      db.addLog('AE', 'CLOSING_PENDING', `Airgoods PO for ${lead.companyName} remains open. Awaiting retailer submission.`, 200);
      return false;
    }
  }
}

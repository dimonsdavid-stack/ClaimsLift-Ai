import { db, PipelineContact, Lead } from '../database';
import { CommunicationAdapter } from '../integrations/communication';

export class CSAgent {
  public static async executeCSAssessment(contact: PipelineContact): Promise<void> {
    const lead = db.getLead(contact.leadId)!;

    db.addLog('CS', 'HEALTH_CHECK_START', `Analyzing telemetry usage metrics and engagement levels for ${lead.companyName}...`, 500);

    // 1. Calculate churn risk score
    // In our simulation, we can dynamically fluctuate the engagementScore to showcase CS agent's responsiveness!
    const usage = contact.productUsageCount;
    const engagement = contact.engagementScore;

    let healthScore: PipelineContact['healthScore'] = 'HEALTHY';
    
    if (engagement < 40) {
      healthScore = 'CHURNING';
      contact.retentionStatus = 'CHURNED';
    } else if (engagement < 70) {
      healthScore = 'RISKY';
    }

    contact.healthScore = healthScore;
    db.savePipelineContact(contact);

    db.addLog('CS', 'HEALTH_CHECK_COMPLETE', `Calculated Health: [${healthScore}] (Engagement: ${engagement}%, Usage Events: ${usage})`, 400);

    // 2. Proactive Outreach for Churn Prevention / Re-engagement
    if (healthScore === 'RISKY') {
      db.addLog('CS', 'STOCK_VELOCITY_ALERT', `Client ${lead.companyName} stock sell-through velocity dropped to ${engagement}%. Triggering proactive retail marketing support!`, 650);

      const emailBody = `Hi ${lead.firstName},\n\nI noticed that sell-through velocity for your Cocktail Stix display has slowed down a bit this week. We are committed to your store's success, so I wanted to share some free sales-boosting resources: we'd love to send you a complimentary bundle of premium cardboard counter-top display stands and custom recipe neck-hangers to draw additional customer interest.\n\nWould you like me to ship these out to you free of charge today?\n\nBest,\nYour Autonomous Wholesale Success Partner`;
      
      await CommunicationAdapter.sendEmail(lead.email, `Boosting Cocktail Stix Shelf Velocity at ${lead.companyName}`, emailBody);
      
      // Simulating a partial recovery on outreach
      contact.engagementScore = Math.min(contact.engagementScore + 15, 100);
      db.savePipelineContact(contact);

      db.addLog('CS', 'CHURN_OUTREACH_SENT', `Proactive re-engagement dispatched. Anticipating engagement lift.`, 300);
    } else if (healthScore === 'CHURNING') {
      db.addLog('CS', 'STOCK_STAGNANT_ALERT', `Client ${lead.companyName} sell-through velocity critically low (${engagement}%). Triggering high-priority retail partner review!`, 700);

      const emailBody = `Hi ${lead.firstName},\n\nWe noticed your store hasn't logged stock depletion updates or requested re-orders in a while. We want to ensure Cocktail Stix performs beautifully for your spirits section. I'd love to schedule a brief 10-minute retail review call to talk about free POS signage, recipe sampling events, or custom flavor bundle discounts.\n\nHere is a calendar link to connect: https://calendly.com/cocktailstix-retail-review\n\nBest,\nMax Leahy\nOwner | Cocktail Stix`;
      
      await CommunicationAdapter.sendEmail(lead.email, `Supporting Cocktail Stix Sales at ${lead.companyName}`, emailBody);
      db.addLog('CS', 'CRITICAL_OUTREACH_SENT', `Emergency re-engagement outreach sent. Status set to CHURNING.`, 300);
    } else {
      // Healthy - offer upsell!
      if (usage > 50 && Math.random() > 0.7) {
        db.addLog('CS', 'UPSELL_OPPORTUNITY_IDENTIFIED', `High stock activity detected (${usage} updates) on ${lead.companyName}. Dispatching autopilot program offer...`, 550);
        const emailBody = `Hi ${lead.firstName},\n\nYour store is seeing incredible sell-through velocity on our zero-sugar Cocktail Stix mixers! To ensure you never run out of stock during peak weekends, you can reorder anytime through our Airgoods wholesale portal — it takes less than 2 minutes.\n\nClick here to place your next order:\nhttps://airgoods.com/brand/0b9eb686-0549-4b0d-a88d-1b891f9a6092\n\nBest,\nMax Leahy\nOwner | Cocktail Stix`;
        await CommunicationAdapter.sendEmail(lead.email, `Unlocking 15% Savings on Cocktail Stix for ${lead.companyName}`, emailBody);
        db.addLog('CS', 'UPSELL_OUTREACH_SENT', `Expansion re-stock upsell offer sent.`, 300);
      }
    }
  }
}

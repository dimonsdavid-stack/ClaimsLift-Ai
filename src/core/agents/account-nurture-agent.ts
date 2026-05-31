import { db, PipelineContact } from '../database';
import { CommunicationAdapter } from '../integrations/communication';

export class AccountNurtureAgent {
  public static async executeNurtureCheck(): Promise<void> {
    db.addLog('AE', 'NURTURE_SCAN_START', `Account Nurture Agent scanning for CLOSED_WON deals ready for 30-day reorder check-in...`, 150);

    const pipeline = db.getPipeline();
    let reordersProcessed = 0;

    for (const contact of pipeline) {
      if (contact.dealStage === 'CLOSED_WON' && contact.retentionStatus === 'ACTIVE') {
        const lead = db.getLead(contact.leadId);
        if (!lead) continue;

        // Simulate a 30-day elapsed check using a probability for the demo
        const isTimeForReorder = Math.random() < 0.15; // 15% chance they hit the 30-day mark

        if (isTimeForReorder) {
          const emailSubject = `Checking in on Cocktail Stix inventory at ${lead.companyName}`;
          const emailBody = `Hi ${lead.firstName},\n\nIt's been a few weeks since your first Cocktail Stix order arrived. Most of our wholesale partners sell through their initial case in about 3 weeks.\n\nAre you ready for a restock? You can easily place a reorder with Net 60 terms right through your Airgoods portal here:\nhttps://airgoods.com/brand/0b9eb686-0549-4b0d-a88d-1b891f9a6092\n\nLet me know if you need any fresh display stands or marketing collateral!\n\nBest,\nMax Leahy\nOwner | Cocktail Stix`;
          
          await CommunicationAdapter.sendEmail(lead.email, emailSubject, emailBody);
          db.addLog('AE', 'NURTURE_REORDER_SENT', `Triggered 30-day reorder sequence for ${lead.companyName}. Airgoods reorder link sent.`, 400, 'SUCCESS');
          
          contact.retentionStatus = 'REORDER_PENDING';
          db.savePipelineContact(contact);
          reordersProcessed++;
        }
      }
    }

    if (reordersProcessed === 0) {
      db.addLog('AE', 'NURTURE_SCAN_COMPLETE', `No accounts currently due for 30-day reorder check-in.`, 150);
    }
  }
}

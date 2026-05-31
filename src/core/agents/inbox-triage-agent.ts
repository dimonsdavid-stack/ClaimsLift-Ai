import { db, PipelineContact, Lead } from '../database';

export class InboxTriageAgent {
  public static async executeTriage(contact: PipelineContact): Promise<boolean> {
    const lead = db.getLead(contact.leadId);
    if (!lead) return false;

    db.addLog('SDR', 'INBOX_TRIAGE_START', `Inbox Triage Agent scanning incoming reply from ${lead.email}...`, 200);

    // Simulate reading the email and classifying sentiment
    const randomSeed = Math.random();
    let sentiment: 'HARD_NO' | 'REFERRAL' | 'OBJECTION' | 'READY';
    let replySnippet = '';

    if (randomSeed < 0.15) {
      sentiment = 'HARD_NO';
      replySnippet = '"Please remove us from your list, we don\'t do cocktail mixers."';
      contact.dealStage = 'CLOSED_LOST';
      contact.retentionStatus = 'CHURNED';
      db.addLog('SDR', 'INBOX_TRIAGE_HARD_NO', `Hard No detected. Removing ${lead.companyName} from outbound sequence.`, 400);
    } else if (randomSeed < 0.3) {
      sentiment = 'REFERRAL';
      replySnippet = '"I handle beer/wine. You want to talk to Sarah on the grocery side."';
      // Reset sequence for referral
      contact.dealStage = 'SDR_OUTBOUND';
      contact.sequenceState = 'EMAIL_1';
      db.addLog('SDR', 'INBOX_TRIAGE_REFERRAL', `Referral detected. Re-routing sequence to new contact at ${lead.companyName}.`, 400);
    } else if (randomSeed < 0.7) {
      sentiment = 'OBJECTION';
      replySnippet = '"Not sure we have the margin or shelf space for this right now."';
      contact.dealStage = 'OBJECTION_HANDLING';
      db.addLog('SDR', 'INBOX_TRIAGE_OBJECTION', `Objection detected. Routing ${lead.companyName} to Objection Engine.`, 400);
    } else {
      sentiment = 'READY';
      replySnippet = '"These look great. Can you send over the pricing and Airgoods link?"';
      contact.dealStage = 'AE_PROPOSAL';
      db.addLog('SDR', 'INBOX_TRIAGE_READY', `Buying intent detected! Fast-tracking ${lead.companyName} directly to AE Proposal.`, 400, 'SUCCESS');
    }

    db.savePipelineContact(contact);
    return true;
  }
}

import { db, Lead, PipelineContact, ABTest } from '../database';
import { CommunicationAdapter } from '../integrations/communication';
import { AIEmailWriter } from '../integrations/ai-email-writer';

export class SDRAgent {
  public static async executeOutboundCycle(leads: Lead[]): Promise<PipelineContact[]> {
    const activeContacts: PipelineContact[] = [];
    const abTests = db.getABTests();
    const subjectTest = abTests.find(t => t.testName === 'SUBJECT_LINE')!;

    for (const lead of leads) {
      // Check if already in pipeline
      let contact = db.getPipelineContact(lead.id);

      if (!contact) {
        // Initialize pipeline contact
        contact = {
          id: `con-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          leadId: lead.id,
          dealStage: 'SDR_OUTBOUND',
          dealValue: 1600, // Standard Professional wholesale order value of $1,600
          sequenceState: 'EMAIL_1',
          lastInteractionDate: new Date().toISOString(),
          healthScore: 'HEALTHY',
          retentionStatus: 'ACTIVE',
          engagementScore: 50,
          productUsageCount: 0
        };
        db.savePipelineContact(contact);
      }

      if (contact.dealStage !== 'SDR_OUTBOUND') {
        continue; // skip if advanced
      }

      // Determine A/B variant to send
      const variant = Math.random() > 0.5 ? 'A' : 'B';

      try {
        db.addLog(
          'SDR',
          'AI_EMAIL_GENERATION_START',
          `Invoking AI Email Writer to generate hyper-personalized ${variant === 'A' ? 'value/ingredients' : 'retail format/portability'} pitch for ${lead.firstName} @ ${lead.companyName} (${lead.title || 'Buyer'})...`,
          600
        );

        // Generate AI-personalized email
        const email = await AIEmailWriter.generateEmail(lead, variant);

        const generationLabel = email.variant === 'AI' ? '🤖 GPT-4o Generated' : '📝 Smart Template';

        db.addLog(
          'SDR',
          'OUTBOUND_SEQUENCE_SEND',
          `[${generationLabel}] Sending Variant ${variant} to ${lead.firstName} @ ${lead.companyName} (${lead.email}) — Subject: "${email.subject}"`,
          950
        );

        // Dispatch via SendGrid / Gmail
        await CommunicationAdapter.sendEmail(lead.email, email.subject, email.body);

        // Track stats for A/B testing
        if (variant === 'A') subjectTest.sendsA++;
        else subjectTest.sendsB++;
        db.updateABTest(subjectTest);

        // Update pipeline state
        contact.sequenceState = 'EMAIL_2';
        contact.lastInteractionDate = new Date().toISOString();
        db.savePipelineContact(contact);

        db.addLog(
          'SDR',
          'OUTBOUND_SEQUENCE_SUCCESS',
          `Email dispatched [${generationLabel}]. Advanced ${contact.id} to EMAIL_2 state.`,
          300
        );
        activeContacts.push(contact);

      } catch (err: any) {
        db.addLog('SDR', 'OUTBOUND_SEQUENCE_FAILURE', `Failed to send email to ${lead.email}: ${err.message}`, 250, 'ERROR');
        throw err;
      }
    }

    return activeContacts;
  }
}


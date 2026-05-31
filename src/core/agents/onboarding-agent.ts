import fs from 'fs';
import path from 'path';
import { db, PipelineContact, Lead } from '../database';
import { CommunicationAdapter } from '../integrations/communication';

export class OnboardingAgent {
  public static async executeOnboarding(contact: PipelineContact): Promise<void> {
    const lead = db.getLead(contact.leadId)!;

    db.addLog('ONBOARDING', 'ONBOARDING_START', `Triggering automated client onboarding for ${lead.companyName}...`, 600);

    try {
      // 1. Programmatically provision client instances (simulate directory and configuration creation)
      const clientDir = path.join(process.cwd(), '.data', 'clients', lead.domain);
      if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
      }

      const clientConfig = {
        clientId: contact.id,
        email: lead.email,
        companyName: lead.companyName,
        pricingValue: contact.dealValue,
        onboardedAt: new Date().toISOString(),
        status: 'ACTIVE'
      };

      fs.writeFileSync(
        path.join(clientDir, 'config.json'),
        JSON.stringify(clientConfig, null, 2),
        'utf-8'
      );

      db.addLog('ONBOARDING', 'PROVISIONING_SUCCESS', `Successfully provisioned isolated workspace directory under: /.data/clients/${lead.domain}`, 300);

      // 2. Dispatch wholesale onboarding and shipment details
      const emailBody = `Hi ${lead.firstName},\n\nWelcome to the Cocktail Stix family! We have successfully processed your wholesale order and prepared your first inventory shipment.\n\nHere are your order details:\n- Order ID: ${contact.id}\n- Shipping Courier: UPS Ground (3-5 business days ETA)\n- Tracking Link: https://cocktailstix.com/wholesale/track/${contact.id}\n\nWe have also provisioned your wholesale retail portal account under: https://cocktailstix.com/wholesale/portal/${lead.domain}\nIn your portal, you can download premium point-of-sale display guides, access high-resolution digital recipe flyers, and schedule automatic monthly re-orders at a 15% discount.\n\nCheers to health-conscious cocktail solutions!\n\nBest regards,\nMax Leahy\nOwner | Cocktail Stix`;
      
      await CommunicationAdapter.sendEmail(lead.email, `Your Cocktail Stix Wholesale Order is Confirmed!`, emailBody);

      // Update state to ONBOARDED
      contact.retentionStatus = 'ONBOARDED';
      contact.engagementScore = 100; // starts high!
      db.savePipelineContact(contact);

      db.addLog('ONBOARDING', 'ONBOARDING_COMPLETED', `Onboarding email dispatched. Workspace configured. Status set to ONBOARDED.`, 400);

    } catch (err: any) {
      db.addLog('ONBOARDING', 'ONBOARDING_FAILURE', `Failed onboarding for ${lead.email}: ${err.message}`, 300, 'ERROR');
      throw err;
    }
  }
}

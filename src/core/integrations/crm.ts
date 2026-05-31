import { PipelineContact } from '../database';

export class CRMAdapter {
  private static syncedDeals: Record<string, any> = {};
  public static simulateLatency = false;

  public static async syncContact(contact: PipelineContact): Promise<{ success: boolean; hubspotId: string; salesforceId: string; latencyMs: number }> {
    const startTime = Date.now();

    // Introduce simulated latency if flagged
    if (this.simulateLatency) {
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s slow response
    } else {
      await new Promise(resolve => setTimeout(resolve, 100)); // standard 100ms
    }

    const hubspotId = `hs-${contact.id.split('-')[1] || 'deal'}`;
    const salesforceId = `sf-${contact.id.split('-')[1] || 'deal'}`;

    this.syncedDeals[contact.id] = {
      ...contact,
      hubspotId,
      salesforceId,
      syncedAt: new Date().toISOString()
    };

    return {
      success: true,
      hubspotId,
      salesforceId,
      latencyMs: Date.now() - startTime
    };
  }

  public static getSyncedDeal(contactId: string) {
    return this.syncedDeals[contactId];
  }
}

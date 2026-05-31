export interface StripeInvoice {
  id: string;
  amount: number;
  customerEmail: string;
  status: 'PAID' | 'OPEN' | 'UNCOLLECTIBLE';
  contractSigned: boolean;
  tier: string;
}

export class StripeAdapter {
  private static invoices: Record<string, StripeInvoice> = {};

  public static async createProposalCheckout(email: string, tier: string, dealValue: number): Promise<StripeInvoice> {
    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const invoice: StripeInvoice = {
      id: invoiceId,
      amount: dealValue,
      customerEmail: email,
      status: 'OPEN',
      contractSigned: false,
      tier
    };

    this.invoices[invoiceId] = invoice;
    return invoice;
  }

  public static async verifyPaymentAndSignature(invoiceId: string): Promise<{ paid: boolean; signed: boolean }> {
    const inv = this.invoices[invoiceId];
    if (!inv) {
      return { paid: false, signed: false };
    }

    // Auto-approve signature and payment in simulation run
    inv.contractSigned = true;
    inv.status = 'PAID';

    return {
      paid: true,
      signed: true
    };
  }

  public static getInvoice(invoiceId: string): StripeInvoice | undefined {
    return this.invoices[invoiceId];
  }
}

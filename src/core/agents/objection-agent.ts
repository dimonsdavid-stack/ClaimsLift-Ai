import { db, PipelineContact, Lead } from '../database';
import { CommunicationAdapter } from '../integrations/communication';

export class ObjectionAgent {
  public static async handleInboundObjection(contact: PipelineContact, objectionText: string): Promise<string> {
    const lead = db.getLead(contact.leadId)!;
    
    db.addLog('OBJECTION', 'INBOUND_OBJECTION_DETECTED', `Received reply from ${lead.firstName} (${lead.email}). Analyzing wholesale objections...`, 600);
    
    let objectionType = 'GENERAL';
    let replyBody = '';

    const textUpper = objectionText.toUpperCase();

    // 1. Identify objection type and overcome it
    if (textUpper.includes('TASTE') || textUpper.includes('SWEET') || textUpper.includes('ARTIFICIAL') || textUpper.includes('SUGAR') || textUpper.includes('BITTER')) {
      objectionType = 'TASTE_SWEETENER_QUERY';
      replyBody = `Hi ${lead.firstName},\n\nI completely understand the concern! Many sugar-free mixers use artificial sweeteners or stevia that leave a bitter, metallic aftertaste. Cocktail Stix is completely different—we sweeten our packets using only pure monk fruit and allulose. Allulose is a natural rare sugar found in figs and raisins that tastes exactly like sugar but has zero glycemic index and zero calories, ensuring a clean, refreshing taste with absolutely no chemical aftertaste.\n\nCould we send over a complimentary retail sample pack so your team can taste the difference next week?`;
    } else if (textUpper.includes('LIQUID') || textUpper.includes('BOTTLE') || textUpper.includes('COMPETITOR') || textUpper.includes('SUPPLIER') || textUpper.includes('ALREADY')) {
      objectionType = 'COMPETITOR_LIQUID_MIXERS';
      replyBody = `Hi ${lead.firstName},\n\nStandard liquid mixers like Stirrings or Fever-Tree are excellent, but they are heavy, bulky, prone to glass breakage, and go bad quickly once opened. Cocktail Stix offer a dry, ultra-portable, single-serve alternative with a 2-year stable shelf life, zero waste, and zero breakage risk. They are extremely easy for customers to grab for picnics, travel, or home bar gifting, making them a high-velocity, high-margin addition next to your spirits section.\n\nWould you like me to send a quick wholesale comparison sheet next week?`;
    } else if (textUpper.includes('RETAIL') || textUpper.includes('SHELF') || textUpper.includes('PACKAGING') || textUpper.includes('BARCODE') || textUpper.includes('UPC') || textUpper.includes('DISPLAY')) {
      objectionType = 'RETAIL_PACKAGING_QUERY';
      replyBody = `Hi ${lead.firstName},\n\nYes, absolutely! Our products are fully retail-ready. We package Cocktail Stix in premium, eye-catching cartons (8 single-serve packets per carton) complete with unique UPC barcodes. They are designed to fit perfectly on standard pegboards (hang-hole ready) or stand upright in beautiful, compact counter-top display cartons that draw immediate customer interest.\n\nWould you like to see a PDF catalog of our retail packaging and counter display configurations?`;
    } else if (textUpper.includes('BUDGET') || textUpper.includes('PRICE') || textUpper.includes('CHEAP') || textUpper.includes('COST') || textUpper.includes('MARGIN')) {
      objectionType = 'PRICE_VS_MARGIN';
      replyBody = `Hi ${lead.firstName},\n\nI completely understand that inventory margins are crucial. Because we produce our dry mixer packets in bulk, we are able to offer our wholesale partners an exceptional 45% to 50% gross margin. Cartons retail at $5.99–$6.99, while your wholesale unit cost is just $3.33 on our standard packages, which makes Cocktail Stix one of the highest margin items in the specialty beverage category.\n\nWould you like to explore our Starter wholesale tier to test sell-through in your store with minimal upfront cost?`;
    } else {
      replyBody = `Hi ${lead.firstName},\n\nThanks for your response. Cocktail Stix offers all-natural, zero-sugar, single-serve drink mixer packets sweetened with monk fruit and allulose—offering premium taste, compact retail packaging, and exceptional gross margins for specialty stores.\n\nLet's get 5 minutes next week to explore a custom wholesale setup for ${lead.companyName}?`;
    }

    db.addLog(
      'OBJECTION',
      'OBJECTION_PARSED',
      `Objection categorized as [${objectionType}]. Drafting tactical wholesale-overcoming response...`,
      750
    );

    // 2. Dispatch response
    await CommunicationAdapter.sendEmail(lead.email, `Re: Cocktail Stix wholesale partnership`, replyBody);

    // Update pipeline status
    contact.dealStage = 'OBJECTION_HANDLING';
    contact.sequenceState = 'COMPLETED';
    contact.lastInteractionDate = new Date().toISOString();
    db.savePipelineContact(contact);

    db.addLog('OBJECTION', 'OBJECTION_REPLY_SENT', `Overcoming message dispatched to ${lead.email}. Pipeline advanced to OBJECTION_HANDLING.`, 400);

    return objectionType;
  }
}

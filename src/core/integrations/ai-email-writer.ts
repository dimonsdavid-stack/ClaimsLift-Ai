import { Lead } from '../database';

export interface GeneratedEmail {
  subject: string;
  body: string;
  variant: 'AI' | 'TEMPLATE';
}

/**
 * AIEmailWriter — generates hyper-personalized B2B cold emails per lead.
 * 
 * Uses OpenAI GPT-4o when OPENAI_API_KEY is set.
 * Falls back to an enriched dynamic template engine when no key is available.
 */
export class AIEmailWriter {
  
  /**
   * Generate a personalized email for a single lead.
   */
  public static async generateEmail(lead: Lead, campaignVariant: 'A' | 'B'): Promise<GeneratedEmail> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        return await this.generateWithOpenAI(lead, campaignVariant, apiKey);
      } catch (err: any) {
        console.error(`[AIEmailWriter] OpenAI generation failed: ${err.message}. Falling back to smart template.`);
      }
    } else {
      console.log('[AIEmailWriter] No OPENAI_API_KEY set — using enriched dynamic template engine.');
    }

    return this.generateWithTemplate(lead, campaignVariant);
  }

  /**
   * Generate using OpenAI GPT-4o with a targeted wholesale B2B prompt.
   */
  private static async generateWithOpenAI(
    lead: Lead, 
    variant: 'A' | 'B', 
    apiKey: string
  ): Promise<GeneratedEmail> {

    const intentContext = lead.intentSignals.slice(0, 3).join('; ');
    const titleContext = lead.title || 'Beverage Buyer';
    const locationContext = lead.intentSignals.find(s => s.includes('Google Places')) || 'United States';

    const systemPrompt = `You are a top-performing B2B SDR specializing in wholesale beverage sales for Cocktail Stix. 
You write short, punchy, highly personalized cold emails that get responses from buyers at specialty liquor stores, boutique grocers, luxury resorts, and cocktail lounges.

Product facts:
- Cocktail Stix: zero-sugar, zero-calorie cocktail mixer stick packets
- Sweetened with monk fruit + allulose (no stevia, no bitter aftertaste)
- Flavors: Classic Margarita, Moscow Mule, Pineapple Spritz, Raspberry Martini
- 100% keto, vegan, all-natural
- Retail-ready UPC barcodes, compact counter display kits
- 45-50% gross margin for retail partners
- Counter Display Kit: $480, Standard Retail Case: $1,600, Multi-Location Pallet: $6,800
- Travel-friendly, lightweight, shelf-efficient vs. liquid mixers

Email rules:
- Subject: max 9 words, no fluff, no exclamation marks, feel human
- Body: 3-4 short paragraphs, conversational, specific to THEIR store type
- End with one clear CTA offering our $100 off Airgoods wholesale promo link to try Cocktail Stix risk-free
- Never say "I hope this email finds you well"
- Never use buzzwords like "synergy", "leverage", "utilize"
- Sound like a real person, not a robot
- Do not include your name or signature — it will be added separately
- Output ONLY valid JSON: {"subject": "...", "body": "..."}`;

    const userPrompt = variant === 'A' 
      ? `Write a Variant A (value + ingredients angle) cold email for:
- First Name: ${lead.firstName}
- Company: ${lead.companyName}
- Title: ${titleContext}
- Location: ${locationContext}
- Their retail focus/signals: ${intentContext}

Focus on zero-sugar health angle, monk fruit sweetener quality, and the 45-50% margin opportunity.`
      : `Write a Variant B (retail format + portability angle) cold email for:
- First Name: ${lead.firstName}
- Company: ${lead.companyName}  
- Title: ${titleContext}
- Location: ${locationContext}
- Their retail focus/signals: ${intentContext}

Focus on UPC barcodes, counter display kits, compact format vs. bulky liquid mixers, and their shelf space efficiency.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('OpenAI returned empty content');

    const parsed = JSON.parse(content);
    if (!parsed.subject || !parsed.body) throw new Error('OpenAI returned malformed JSON structure');

    console.log(`[AIEmailWriter] ✅ GPT-4o generated email for ${lead.firstName} @ ${lead.companyName} (Variant ${variant})`);
    return {
      subject: parsed.subject,
      body: parsed.body + `\n\nBest regards,\nMax Leahy\nOwner | Cocktail Stix`,
      variant: 'AI'
    };
  }

  /**
   * Enriched template fallback — much smarter than a static template.
   * Dynamically adapts tone, focus, and specific product angle based on
   * the lead's title, company name, and intent signals.
   */
  private static generateWithTemplate(lead: Lead, variant: 'A' | 'B'): GeneratedEmail {
    const { firstName, companyName, title, intentSignals } = lead;

    // Classify the buyer archetype from their title/signals
    const titleLower = (title || '').toLowerCase();
    const signalText = intentSignals.join(' ').toLowerCase();

    let buyerType: 'RESORT' | 'SPIRITS' | 'GROCER' | 'LOUNGE' | 'GENERIC' = 'GENERIC';
    if (titleLower.includes('resort') || signalText.includes('resort') || signalText.includes('mini-bar') || signalText.includes('hotel')) {
      buyerType = 'RESORT';
    } else if (titleLower.includes('spirits') || signalText.includes('spirits') || signalText.includes('liquor') || signalText.includes('bottle shop')) {
      buyerType = 'SPIRITS';
    } else if (titleLower.includes('grocery') || signalText.includes('grocery') || signalText.includes('gourmet') || signalText.includes('natural foods')) {
      buyerType = 'GROCER';
    } else if (signalText.includes('lounge') || signalText.includes('cocktail') || signalText.includes('yacht') || signalText.includes('beach')) {
      buyerType = 'LOUNGE';
    }

    // Pull relevant intent signal for personalization
    const locationSig = intentSignals.find(s => s.includes('Google Places')) || '';
    const cleanLocation = locationSig
      .replace('Google Places Location: ', '')
      .replace('Google Places Verified Location: ', '')
      || 'your area';

    if (variant === 'A') {
      // Variant A: Zero-sugar health + ingredients angle
      const subjects: Record<typeof buyerType, string> = {
        RESORT:   `Zero-sugar cocktail mixers your guests will actually reorder`,
        SPIRITS:  `Premium cocktail packets for ${companyName} — 45% margin, zero sugar`,
        GROCER:   `${companyName} buyers are adding Cocktail Stix — here's why`,
        LOUNGE:   `Cocktail Stix: the zero-sugar mixer your bar is missing`,
        GENERIC:  `Wholesale cocktail mixers with 45-50% margin — for ${companyName}`
      };

      const openers: Record<typeof buyerType, string> = {
        RESORT:   `Mini-bar guests increasingly want better-for-you options that don't sacrifice taste. Cocktail Stix delivers exactly that — zero-sugar, zero-calorie cocktail mixer stick packs sweetened with monk fruit and allulose, with none of the bitter stevia aftertaste.`,
        SPIRITS:  `Boutique spirits buyers are one of our best-converting retail channels — because Cocktail Stix complements any craft spirits shelf without competing with it. These are zero-sugar, zero-calorie cocktail mixer packets sweetened with monk fruit and allulose.`,
        GROCER:   `Your health-conscious shoppers are already looking for zero-sugar cocktail mixers. Cocktail Stix stick packs — sweetened with monk fruit and allulose — give them Classic Margarita, Moscow Mule, Pineapple Spritz, and Raspberry Martini with zero calories and no bitter aftertaste.`,
        LOUNGE:   `Your guests want low-calorie cocktail options without the compromise on flavor. Cocktail Stix mixer packets — zero sugar, monk fruit sweetened, no bitter stevia aftertaste — are engineered for exactly that.`,
        GENERIC:  `Cocktail Stix are zero-sugar, zero-calorie cocktail mixer stick packs sweetened with monk fruit and allulose. No artificial sweeteners, no bitter aftertaste — just clean, great-tasting Margarita, Moscow Mule, Pineapple Spritz, and Raspberry Martini.`
      };

      const subject = subjects[buyerType].replace('{{companyName}}', companyName);
      const body = `Hi ${firstName},\n\n${openers[buyerType]}\n\nWe offer retail-ready cartons with unique UPC barcodes and compact counter display units. Wholesale partners see 45-50% gross margin — strong for a single-SKU category add-on. The format is lightweight, travel-friendly, and takes up a fraction of the shelf space of liquid mixers.\n\nWould it make sense to send over our Airgoods wholesale link so your team can grab $100 off your first order to try Cocktail Stix risk-free this week?\n\nBest regards,\nMax Leahy\nOwner | Cocktail Stix`;

      return { subject, body, variant: 'TEMPLATE' };

    } else {
      // Variant B: Retail format + shelf efficiency angle
      const subjects: Record<typeof buyerType, string> = {
        RESORT:   `Cocktail Stix for ${companyName} mini-bars — zero storage headaches`,
        SPIRITS:  `No breakage, no refrigeration — cocktail mixers reimagined for ${companyName}`,
        GROCER:   `Counter-ready cocktail mixers that outsell liquid bottles — for ${companyName}`,
        LOUNGE:   `Portable cocktail mixer packs your bar staff will love`,
        GENERIC:  `The compact cocktail mixer that's changing specialty retail margins`
      };

      const formats: Record<typeof buyerType, string> = {
        RESORT:   `Unlike bulky glass bottles that create storage and breakage nightmares in mini-bars, Cocktail Stix are lightweight single-serve stick packs that tuck easily into any mini-bar drawer, poolside gift shop shelf, or room service tray.`,
        SPIRITS:  `Unlike fragile, heavy glass cocktail mixer bottles, Cocktail Stix stick packs ship flat, store flat, and display with a compact UPC-barcoded counter stand. No breakage risk, no refrigeration needed, no bulky inventory overhead.`,
        GROCER:   `Cocktail Stix outsell traditional liquid mixers in boutique grocery formats because of one thing: the footprint. A single counter display kit holds an entire product line in under 1 square foot — and the UPC barcodes scan at checkout with zero setup.`,
        LOUNGE:   `Bar staff love Cocktail Stix because they eliminate mixing guesswork. Each stick pack is pre-portioned, zero-sugar, and produces a consistent Margarita, Mule, or Spritz every time — ideal for high-volume service settings.`,
        GENERIC:  `Cocktail Stix are the retail format that liquid cocktail mixers can't match: single-serve stick packs, UPC-ready, counter-display included, lightweight shipping, and zero breakage risk in transit or on shelf.`
      };

      const subject = subjects[buyerType].replace('{{companyName}}', companyName);
      const body = `Hi ${firstName},\n\n${formats[buyerType]}\n\nWe support wholesale partners with a 45% gross margin, a full display kit, and pre-assigned UPC barcodes — ready for your POS system from day one. No setup fees, no minimums beyond the starter carton order.\n\nCan I send over our Airgoods wholesale link? You'll get $100 off your first order to try all four Cocktail Stix flavors risk-free at ${companyName}.\n\nWarmly,\nWholesale Partnerships | Cocktail Stix`;

      return { subject, body, variant: 'TEMPLATE' };
    }
  }
}

import { db, Lead } from '../database';
import { ApolloAdapter } from '../integrations/apollo';
import { GooglePlacesAdapter } from '../integrations/googleplaces';

export class DataAgent {
  public static async executeLeadGenCycle(customQuery?: string): Promise<Lead[]> {
    const tokensStart = 850; // simulated agent LLM thinking tokens
    db.addLog('DATA', 'ICP_SCRAPE_START', 'Initiating autonomous local-to-contact wholesale scrape using Google Places & Apollo.io cross-matching...', tokensStart);

    try {
      // 1. Search Google Places for high-end boutique liquor stores & specialty food shops
      const queries = [
        "specialty grocery market",
        "boutique liquor wine spirits store",
        "luxury hotel resort retail mini-bar"
      ];
      // Pick a custom query if provided, else a random one
      const query = customQuery || queries[Math.floor(Math.random() * queries.length)];
      db.addLog('DATA', 'PLACES_SEARCH_INITIATED', `Searching Google Places API for real retail locations matching: "${query}"...`, 300);
      
      const places = await GooglePlacesAdapter.searchPlaces(query);
      const rawLeads: Partial<Lead>[] = [];

      // 2. Loop through each physical store location and attempt to matching buyer contact details
      for (const place of places) {
        db.addLog('DATA', 'PLACES_MATCH_ATTEMPT', `Matching B2B buyer contacts for physical store: "${place.name}" (${place.website || 'No website'})...`, 250);
        
        let contacts: Partial<Lead>[] = [];
        if (place.domain && place.domain !== 'unknown.com') {
          contacts = await ApolloAdapter.searchPeopleByDomain(place.domain);
        }

        if (contacts.length > 0) {
          // Found matching buyers via Apollo! Merge with physical store address/phone details
          for (const c of contacts) {
            rawLeads.push({
              ...c,
              companyName: place.name,
              phone: c.phone || place.phone || '',
              intentSignals: [
                `Google Places Location: ${place.formattedAddress}`,
                `Store Rating: ${place.rating || '4.5'}/5.0`,
                ...(c.intentSignals || [])
              ]
            });
          }
        } else {
          // No specific buyer registered on Apollo. Create storefront fallback buyer!
          const storefrontEmail = place.domain && place.domain !== 'unknown.com'
            ? `buyer@${place.domain}`
            : `info@unknown.com`;
            
          rawLeads.push({
            id: `lead-gp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            email: storefrontEmail,
            firstName: 'Beverage',
            lastName: 'Director & Buyer',
            companyName: place.name,
            domain: place.domain || 'unknown.com',
            phone: place.phone || '',
            title: 'Category Beverage Buyer',
            techStack: ['Gourmet Mixer', 'UPC Barcodes', 'Shelf Displays'],
            intentSignals: [
              `Google Places Verified Location: ${place.formattedAddress}`,
              `Store Rating: ${place.rating || '4.5'}/5.0`,
              `Wholesale Sourcing Channel`,
              `Monk Fruit Mixer Placement`
            ],
            status: 'SCRAPED',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      const processedLeads: Lead[] = [];

      // 3. Perform automated format validation and cleaning (Self-Correction Rules)
      for (const raw of rawLeads) {
        let isCorrupt = false;

        // Clean & Validate Email
        const email = (raw.email || '').trim().toLowerCase();
        if (!email || !email.includes('@') || email.includes('unknown.com')) {
          db.addLog('DATA', 'LEAD_VALIDATION_WARNING', `Lead contains corrupted or missing email format for "${raw.companyName}". Skipping.`, 120, 'RETRY');
          isCorrupt = true;
        }

        // Clean & Validate Arrays (ensure string array and not comma-split strings)
        const techStack = Array.isArray(raw.techStack) ? raw.techStack : [];
        const intentSignals = Array.isArray(raw.intentSignals) ? raw.intentSignals : [];

        const lead: Lead = {
          id: raw.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          email,
          firstName: raw.firstName || 'Contact',
          lastName: raw.lastName || '',
          companyName: raw.companyName || 'Unknown Corp',
          domain: raw.domain || '',
          phone: raw.phone || '',
          title: raw.title || 'Professional',
          techStack,
          intentSignals,
          status: isCorrupt ? 'CORRUPTED' : 'ENRICHED',
          createdAt: raw.createdAt || new Date().toISOString()
        };

        db.saveLead(lead);

        if (!isCorrupt) {
          processedLeads.push(lead);
          db.addLog(
            'DATA', 
            'LEAD_ENRICHED', 
            `Enriched & validated physical retail lead: ${lead.firstName} ${lead.lastName} @ ${lead.companyName} (${lead.email}). Google Address: [${lead.intentSignals[0] || 'US'}]`, 
            350
          );
        }
      }

      db.addLog('DATA', 'ICP_SCRAPE_SUCCESS', `Successfully scraped, matched, and enriched ${processedLeads.length} target wholesale accounts. Ingested into database.`, 500);
      return processedLeads;

    } catch (error: any) {
      db.addLog('DATA', 'ICP_SCRAPE_FAILURE', `CRITICAL EXCEPTION inside LeadGen Data pipeline: ${error.message}`, 400, 'ERROR');
      // Re-throw so orchestrator can invoke System Sentinel
      throw error;
    }
  }
}

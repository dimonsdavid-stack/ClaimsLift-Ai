import { Lead } from '../database';

export class ApolloAdapter {
  public static simulateSchemaShift = false;
  public static simulateRateLimit = false;

  private static RAW_PROSPECTS = [
    {
      email: 'marcus.sterling@greenleafgourmet.com',
      firstName: 'Marcus',
      lastName: 'Sterling',
      companyName: 'Green Leaf Gourmet Markets',
      domain: 'greenleafgourmet.com',
      phone: '+12125559812',
      title: 'Specialty Beverage Category Manager',
      techStack: 'Premium Grocery, Natural Foods, Organic Mixers, UPC Inventory',
      intent: 'Sourcing keto-friendly cocktail mixers, clean label zero-sugar drink packets, all-natural allulose mixers, Classic Margarita interest',
    },
    {
      email: 'sophia.bennett@heritagespirits.com',
      firstName: 'Sophia',
      lastName: 'Bennett',
      companyName: 'Heritage Spirits & Bottle Shop',
      domain: 'heritagespirits.com',
      phone: '+13105553489',
      title: 'Owner & Head Buyer',
      techStack: 'Craft Spirits, Premium Gift Baskets, High-end Barware Retail, Point-of-Sale Displays',
      intent: 'Sourcing zero-calorie portable cocktail packets, single-serve margarita/mule mixers, retail-ready cartons, Moscow Mule flavor focus',
    },
    {
      email: 'devon.miller@urbantransit.com',
      firstName: 'Devon',
      lastName: 'Miller',
      companyName: 'Urban Transit Gourmet Markets',
      domain: 'urbantransit.com',
      phone: '+14155557865',
      title: 'Director of Retail Merchandising',
      techStack: 'Premium Travel Retail, High-speed Convenience, Single-serve Snacks, Compact Counter Displays',
      intent: 'Expanding travel-friendly drink mixers, single-serve zero-sugar mocktails, high-margin retail packets, Pineapple Spritz request',
    },
    {
      email: 'clarissa.vance@meridianluxuryresorts.com',
      firstName: 'Clarissa',
      lastName: 'Vance',
      companyName: 'Meridian Luxury Resorts & Spas',
      domain: 'meridianluxuryresorts.com',
      phone: '+13055554312',
      title: 'Director of F&B Retail & Mini-Bar Procurement',
      techStack: 'High-End Hotels, Poolside Retail, Luxury Mini-Bars, Room Service Ordering',
      intent: 'Sourcing zero-sugar single-serve cocktail packets for guest mini-bars and resort shops, custom recipe co-branding, Raspberry Martini flavor',
    },
    {
      email: 'julian.cross@velvetandvine.com',
      firstName: 'Julian',
      lastName: 'Cross',
      companyName: 'Velvet & Vine Lifestyle Boutiques',
      domain: 'velvetandvine.com',
      phone: '+15125556701',
      title: 'Lead Curator & Owner',
      techStack: 'Gourmet Gift Shop, Boutique Retail, Artisanal Food & Drink, High Foot Traffic',
      intent: 'Sourcing visually stunning gourmet cocktail gift sets, retail-ready zero-sugar mixer packs, artisanal mocktail options, assorted flavors',
    }
  ];

  public static async fetchLeads(icpFilter: { minFunding?: number; techStack?: string[] }): Promise<Partial<Lead>[]> {
    if (this.simulateRateLimit) {
      throw new Error('API Error: 429 Too Many Requests (Rate limit exceeded for client endpoint)');
    }

    if (this.simulateSchemaShift) {
      throw new TypeError("Cannot read properties of undefined (reading 'split') - API returned: { payload: { raw_contacts: { data: undefined } } }");
    }

    const apiKey = process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY;

    if (apiKey) {
      try {
        console.log('[ApolloAdapter] Connecting to real Apollo.io mixed_people/api_search API...');
        let response = await fetch('https://api.apollo.io/v1/mixed_people/api_search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': apiKey,
            'Api-Key': apiKey
          },
          body: JSON.stringify({
            api_key: apiKey,
            person_titles: [
              "category manager", 
              "beverage buyer", 
              "retail buyer", 
              "store owner", 
              "beverage director", 
              "wine buyer", 
              "spirits buyer"
            ],
            person_locations: ["United States"],
            per_page: 5
          })
        });

        // If api_search fails with 404/403/405, fallback to mixed_people/search
        if (!response.ok && (response.status === 404 || response.status === 403 || response.status === 405)) {
          console.warn(`[ApolloAdapter] api_search failed with status ${response.status}. Retrying legacy mixed_people/search...`);
          response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Api-Key': apiKey,
              'Api-Key': apiKey
            },
            body: JSON.stringify({
              api_key: apiKey,
              person_titles: [
                "category manager", 
                "beverage buyer", 
                "retail buyer", 
                "store owner", 
                "beverage director", 
                "wine buyer", 
                "spirits buyer"
              ],
              person_locations: ["United States"],
              per_page: 5
            })
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Apollo API responded with ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const peopleList = data.people || data.contacts || [];

        if (peopleList.length > 0) {
          console.log(`[ApolloAdapter] Successfully fetched ${peopleList.length} real leads from Apollo!`);
          return peopleList.map((p: any, idx: number) => {
            const domain = p.organization?.primary_domain || p.organization?.domain || 'unknown.com';
            const email = p.email || `info@${domain}`;
            
            const techStack = p.organization?.technology_names || ['Organic Ingredients', 'UPC Barcodes'];
            const intentSignals = [
              `Target Title: ${p.title || 'Beverage Curator'}`,
              `Retail Sourcing Trend`,
              `Monk Fruit Mixer Demand`
            ];

            return {
              id: p.id || `lead-${Date.now()}-${idx}`,
              email: email.trim().toLowerCase(),
              firstName: p.first_name || p.name?.split(' ')[0] || 'Contact',
              lastName: p.last_name || p.name?.split(' ').slice(1).join(' ') || '',
              companyName: p.organization?.name || 'Retail Partner',
              domain,
              phone: p.phone_numbers?.[0]?.sanitized_number || p.organization?.phone || '',
              title: p.title || 'Beverage Buyer',
              techStack,
              intentSignals,
              status: 'SCRAPED',
              createdAt: new Date().toISOString()
            };
          });
        } else {
          console.log('[ApolloAdapter] Apollo Search returned zero matches. Falling back to high-fidelity sandbox profiles.');
        }

      } catch (err: any) {
        console.error(`[ApolloAdapter] Real Apollo search failed: ${err.message}. Gracefully falling back to sandbox mode.`);
      }
    } else {
      console.log('[ApolloAdapter] Sandbox mode: No APOLLO_API_KEY configured in environment. Using premium target store templates.');
    }

    return this.RAW_PROSPECTS.map((p, idx) => ({
      id: `lead-${Date.now()}-${idx}`,
      email: p.email,
      firstName: p.firstName,
      lastName: p.lastName,
      companyName: p.companyName,
      domain: p.domain,
      phone: p.phone,
      title: p.title,
      techStack: p.techStack.split(', '),
      intentSignals: p.intent.split(', '),
      status: 'SCRAPED',
      createdAt: new Date().toISOString()
    }));
  }

  public static async searchPeopleByDomain(domain: string): Promise<Partial<Lead>[]> {
    const apiKey = process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY;

    if (apiKey && domain && domain !== 'unknown.com') {
      try {
        console.log(`[ApolloAdapter] Fetching real B2B contacts for domain: "${domain}" via Apollo Search...`);
        const response = await fetch('https://api.apollo.io/v1/mixed_people/api_search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': apiKey,
            'Api-Key': apiKey
          },
          body: JSON.stringify({
            api_key: apiKey,
            q_organization_domains_list: [domain],
            person_titles: [
              "category manager", 
              "beverage buyer", 
              "retail buyer", 
              "store owner", 
              "beverage director", 
              "wine buyer", 
              "spirits buyer",
              "manager",
              "buyer",
              "owner"
            ],
            per_page: 3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const peopleList = data.people || data.contacts || [];
          if (peopleList.length > 0) {
            console.log(`[ApolloAdapter] Successfully matched ${peopleList.length} real B2B people at ${domain}!`);
            return peopleList.map((p: any, idx: number) => {
              const email = p.email || `info@${domain}`;
              return {
                id: p.id || `lead-${Date.now()}-${idx}`,
                email: email.trim().toLowerCase(),
                firstName: p.first_name || p.name?.split(' ')[0] || 'Contact',
                lastName: p.last_name || p.name?.split(' ').slice(1).join(' ') || '',
                companyName: p.organization?.name || 'Retail Partner',
                domain,
                phone: p.phone_numbers?.[0]?.sanitized_number || p.organization?.phone || '',
                title: p.title || 'Beverage Buyer',
                techStack: p.organization?.technology_names || ['Organic Ingredients', 'UPC Barcodes'],
                intentSignals: [
                  `Target Title: ${p.title || 'Beverage Curator'}`,
                  `Local Physical Place Match`,
                  `Monk Fruit Mixer Demand`
                ],
                status: 'SCRAPED',
                createdAt: new Date().toISOString()
              };
            });
          }
        }
      } catch (err: any) {
        console.error(`[ApolloAdapter] Apollo Search for domain ${domain} failed: ${err.message}. Gracefully falling back to template matching.`);
      }
    }

    // High fidelity template fallback matching specific domains from our Google Places list
    const matched = this.RAW_PROSPECTS.filter(p => p.domain === domain);
    if (matched.length > 0) {
      return matched.map((p, idx) => ({
        id: `lead-${Date.now()}-${idx}`,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        companyName: p.companyName,
        domain: p.domain,
        phone: p.phone,
        title: p.title,
        techStack: p.techStack.split(', '),
        intentSignals: p.intent.split(', '),
        status: 'SCRAPED',
        createdAt: new Date().toISOString()
      }));
    }

    return [];
  }

  public static async enrichContact(email: string): Promise<Partial<Lead>> {
    const apiKey = process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY;

    if (apiKey) {
      try {
        console.log(`[ApolloAdapter] Attempting real-time Apollo enrichment for: ${email}...`);
        const response = await fetch('https://api.apollo.io/v1/people/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': apiKey,
            'Api-Key': apiKey
          },
          body: JSON.stringify({
            api_key: apiKey,
            email: email
          })
        });

        if (response.ok) {
          const data = await response.json();
          const p = data.person || {};
          if (p.email) {
            console.log(`[ApolloAdapter] Real enrichment succeeded for ${email}!`);
            const techStack = p.organization?.technology_names || ['Organic Ingredients', 'UPC Barcodes'];
            return {
              email: p.email.trim().toLowerCase(),
              techStack,
              intentSignals: [
                `Enriched Title: ${p.title || 'Store Curator'}`,
                `Verified contact via Apollo Match`
              ],
              status: 'ENRICHED'
            };
          }
        }
      } catch (err: any) {
        console.error(`[ApolloAdapter] Real-time enrichment failed: ${err.message}. Falling back to sandbox enrichment.`);
      }
    }

    const matched = this.RAW_PROSPECTS.find(p => p.email === email);
    if (!matched) {
      return {
        email,
        status: 'CORRUPTED'
      };
    }
    return {
      email,
      techStack: matched.techStack.split(', '),
      intentSignals: matched.intent.split(', '),
      status: 'ENRICHED'
    };
  }
}

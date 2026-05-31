export interface GooglePlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  phone?: string;
  website?: string;
  rating?: number;
  domain?: string;
}

export class GooglePlacesAdapter {
  private static MOCK_PLACES: GooglePlaceResult[] = [
    {
      id: 'gp-1',
      name: 'Green Leaf Gourmet Market - West Hollywood',
      formattedAddress: '8500 Santa Monica Blvd, West Hollywood, CA 90069',
      phone: '+1 310-555-9812',
      website: 'https://greenleafgourmet.com',
      rating: 4.7,
      domain: 'greenleafgourmet.com'
    },
    {
      id: 'gp-2',
      name: 'Heritage Wine & Spirits',
      formattedAddress: '9400 Olympic Blvd, Beverly Hills, CA 90212',
      phone: '+1 310-555-3489',
      website: 'https://heritagespirits.com',
      rating: 4.9,
      domain: 'heritagespirits.com'
    },
    {
      id: 'gp-3',
      name: 'Urban Transit Gourmet Markets - Grand Central',
      formattedAddress: '89 E 42nd St, New York, NY 10017',
      phone: '+1 212-555-7865',
      website: 'https://urbantransit.com',
      rating: 4.5,
      domain: 'urbantransit.com'
    },
    {
      id: 'gp-4',
      name: 'Meridian Resort & Spa Poolside Retail',
      formattedAddress: '4400 Collins Ave, Miami Beach, FL 33140',
      phone: '+1 305-555-4312',
      website: 'https://meridianluxuryresorts.com',
      rating: 4.8,
      domain: 'meridianluxuryresorts.com'
    },
    {
      id: 'gp-5',
      name: 'Velvet & Vine Lifestyle Boutiques',
      formattedAddress: '1200 S Congress Ave, Austin, TX 78704',
      phone: '+1 512-555-6701',
      website: 'https://velvetandvine.com',
      rating: 4.6,
      domain: 'velvetandvine.com'
    }
  ];

  public static async searchPlaces(query: string): Promise<GooglePlaceResult[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (apiKey) {
      try {
        console.log(`[GooglePlacesAdapter] Connecting to real Google Places API search for: "${query}"...`);
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating'
          },
          body: JSON.stringify({
            textQuery: query
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google Places responded with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const rawPlaces = data.places || [];

        console.log(`[GooglePlacesAdapter] Real Places API successfully fetched ${rawPlaces.length} retail locations!`);

        return rawPlaces.map((p: any) => {
          let website = p.websiteUri || '';
          let domain = 'unknown.com';
          if (website) {
            try {
              const url = new URL(website);
              domain = url.hostname.replace('www.', '');
            } catch (urlErr) {
              // fallback raw parsing
              const clean = website.replace('https://', '').replace('http://', '').split('/')[0];
              domain = clean.replace('www.', '');
            }
          }

          return {
            id: p.id || `gp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: p.displayName?.text || 'Boutique Liquor/Grocery partner',
            formattedAddress: p.formattedAddress || 'United States',
            phone: p.nationalPhoneNumber || '',
            website: website,
            rating: p.rating || 4.5,
            domain
          };
        });

      } catch (err: any) {
        console.error(`[GooglePlacesAdapter] Real search failed: ${err.message}. Gracefully falling back to high-fidelity retail sandbox locations.`);
      }
    } else {
      console.log('[GooglePlacesAdapter] Sandbox mode: No GOOGLE_PLACES_API_KEY configured in environment. Using premium target local stores.');
    }

    // High fidelity sandbox filtering
    const normalizedQuery = query.toLowerCase();
    const filtered = this.MOCK_PLACES.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.formattedAddress.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes('specialty') ||
      normalizedQuery.includes('liquor') ||
      normalizedQuery.includes('hotel') ||
      normalizedQuery.includes('grocery') ||
      normalizedQuery.includes('boutique') ||
      normalizedQuery.includes('bar') ||
      normalizedQuery.includes('stix')
    );

    return filtered.length > 0 ? filtered : this.MOCK_PLACES;
  }
}

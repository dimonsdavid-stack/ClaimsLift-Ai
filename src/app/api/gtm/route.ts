import { NextResponse } from 'next/server';
import { db } from '../../../core/database';
import { GTMOrchestrator } from '../../../core/orchestrator';
import { CommunicationAdapter } from '../../../core/integrations/communication';
import fs from 'fs';
import path from 'path';

export async function GET() {
  return NextResponse.json({
    leads: db.getLeads(),
    pipeline: db.getPipeline(),
    logs: db.getLogs(),
    abTests: db.getABTests(),
    selfHealing: db.getSelfHealingLogs(),
    outbox: CommunicationAdapter.getOutbox(),
    icpProfile: db.getICPProfile(),
    scientistReports: db.getScientistReports(),
    competitorIntelReports: db.getCompetitorIntelReports(),
    settings: {
      hasApolloKey: !!(process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY),
      hasGooglePlacesKey: !!(process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY),
      hasOpenAIKey: !!(process.env.OPENAI_API_KEY),
      isLiveSmtp: (process.env.GMAIL_SMTP_LIVE === 'true' || process.env.NEXT_PUBLIC_GMAIL_SMTP_LIVE === 'true'),
      gmailUser: process.env.GMAIL_USER || 'cocktailstix@cockailstix.net'
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, errorType } = body;

    if (action === 'RESET') {
      db.clear();
      CommunicationAdapter.clearOutbox();
      return NextResponse.json({ success: true, message: 'Database reset successfully.' });
    }

    if (action === 'SAVE_KEYS') {
      const { apolloApiKey, googlePlacesApiKey, openAIApiKey, liveSmtp } = body;
      
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      let lines = envContent.split('\n');
      let foundApollo = false;
      let foundGoogle = false;
      let foundOpenAI = false;
      let foundLive = false;

      lines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('APOLLO_API_KEY=')) {
          foundApollo = true;
          return apolloApiKey !== undefined ? `APOLLO_API_KEY="${apolloApiKey}"` : line;
        }
        if (trimmed.startsWith('GOOGLE_PLACES_API_KEY=')) {
          foundGoogle = true;
          return googlePlacesApiKey !== undefined ? `GOOGLE_PLACES_API_KEY="${googlePlacesApiKey}"` : line;
        }
        if (trimmed.startsWith('OPENAI_API_KEY=')) {
          foundOpenAI = true;
          return openAIApiKey !== undefined ? `OPENAI_API_KEY="${openAIApiKey}"` : line;
        }
        if (trimmed.startsWith('GMAIL_SMTP_LIVE=')) {
          foundLive = true;
          return liveSmtp !== undefined ? `GMAIL_SMTP_LIVE="${liveSmtp ? 'true' : 'false'}"` : line;
        }
        return line;
      });

      if (!foundApollo && apolloApiKey !== undefined) {
        lines.push(`APOLLO_API_KEY="${apolloApiKey}"`);
      }
      if (!foundGoogle && googlePlacesApiKey !== undefined) {
        lines.push(`GOOGLE_PLACES_API_KEY="${googlePlacesApiKey}"`);
      }
      if (!foundOpenAI && openAIApiKey !== undefined) {
        lines.push(`OPENAI_API_KEY="${openAIApiKey}"`);
      }
      if (!foundLive && liveSmtp !== undefined) {
        lines.push(`GMAIL_SMTP_LIVE="${liveSmtp ? 'true' : 'false'}"`);
      }

      fs.writeFileSync(envPath, lines.filter(line => line.trim() !== '').join('\n') + '\n', 'utf-8');

      // Update in memory so it is immediately active!
      if (apolloApiKey !== undefined) {
        process.env.APOLLO_API_KEY = apolloApiKey;
        process.env.NEXT_PUBLIC_APOLLO_API_KEY = apolloApiKey;
      }
      if (googlePlacesApiKey !== undefined) {
        process.env.GOOGLE_PLACES_API_KEY = googlePlacesApiKey;
        process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = googlePlacesApiKey;
      }
      if (openAIApiKey !== undefined) {
        process.env.OPENAI_API_KEY = openAIApiKey;
      }
      if (liveSmtp !== undefined) {
        process.env.GMAIL_SMTP_LIVE = liveSmtp ? 'true' : 'false';
        process.env.NEXT_PUBLIC_GMAIL_SMTP_LIVE = liveSmtp ? 'true' : 'false';
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Credentials updated and loaded in-memory successfully.',
        hasApolloKey: !!(process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY),
        hasGooglePlacesKey: !!(process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY),
        hasOpenAIKey: !!(process.env.OPENAI_API_KEY),
        isLiveSmtp: (process.env.GMAIL_SMTP_LIVE === 'true' || process.env.NEXT_PUBLIC_GMAIL_SMTP_LIVE === 'true')
      });
    }

    if (action === 'RUN_STEP') {
      const { customQuery } = body;
      const result = await GTMOrchestrator.executeFullGTMStep(errorType, customQuery);
      return NextResponse.json(result);
    }

    if (action === 'SAVE_AB_TESTS') {
      const { abTests } = body;
      if (Array.isArray(abTests)) {
        for (const test of abTests) {
          const current = db.getABTests().find(t => t.id === test.id);
          if (current) {
            current.variantA = test.variantA || current.variantA;
            current.variantB = test.variantB || current.variantB;
            current.variantA_body = test.variantA_body !== undefined ? test.variantA_body : current.variantA_body;
            current.variantB_body = test.variantB_body !== undefined ? test.variantB_body : current.variantB_body;
            current.activeVariant = test.activeVariant || current.activeVariant;
            db.updateABTest(current);
          }
        }
        return NextResponse.json({ success: true, message: 'Campaign A/B subject and pitch templates updated successfully.' });
      }
      return NextResponse.json({ success: false, error: 'Invalid A/B templates payload' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

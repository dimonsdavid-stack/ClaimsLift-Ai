import { db, PipelineContact, Lead } from './database';
import { DataAgent } from './agents/data-agent';
import { SDRAgent } from './agents/sdr-agent';
import { ObjectionAgent } from './agents/objection-agent';
import { AEAgent } from './agents/ae-agent';
import { OnboardingAgent } from './agents/onboarding-agent';
import { CSAgent } from './agents/cs-agent';
import { AuditAgent } from './agents/audit-agent';
import { SentinelAgent } from './agents/sentinel-agent';
import { ICPOptimizerAgent } from './agents/icp-optimizer-agent';
import { CampaignScientistAgent } from './agents/campaign-scientist-agent';
import { CompetitorIntelAgent } from './agents/competitor-intel-agent';
import { InboxTriageAgent } from './agents/inbox-triage-agent';
import { AccountNurtureAgent } from './agents/account-nurture-agent';
import { ApolloAdapter } from './integrations/apollo';
import { CommunicationAdapter } from './integrations/communication';

export class GTMOrchestrator {
  private static isRunning = false;

  public static async executeFullGTMStep(simulateErrorType?: 'SCHEMA' | 'RATE' | 'SMTP', customQuery?: string): Promise<{
    success: boolean;
    healed: boolean;
    scrapedCount: number;
    activeDealsCount: number;
    closedWonCount: number;
    auditResults?: any;
  }> {
    if (this.isRunning) {
      return { success: false, healed: false, scrapedCount: 0, activeDealsCount: 0, closedWonCount: 0 };
    }
    this.isRunning = true;

    let healed = false;
    let scrapedCount = 0;
    
    // Set simulated failures if requested
    if (simulateErrorType === 'SCHEMA') {
      ApolloAdapter.simulateSchemaShift = true;
    } else if (simulateErrorType === 'RATE') {
      ApolloAdapter.simulateRateLimit = true;
    } else if (simulateErrorType === 'SMTP') {
      CommunicationAdapter.simulateCarrierFailure = true;
    }

    // Always reset simulation flags and isRunning in finally — prevents sticky failure state
    const resetAll = () => {
      ApolloAdapter.simulateSchemaShift = false;
      ApolloAdapter.simulateRateLimit = false;
      CommunicationAdapter.simulateCarrierFailure = false;
      this.isRunning = false;
    };

    try {
      db.addLog('DATA', 'CYCLE_INITIATED', '--- RUNNING FULL ORCHESTRATED GTM LIFE CYCLE STEP ---', 100);

      // ========================================================
      // SELF-IMPROVING LAYER — runs every cycle
      // ========================================================

      // 1. ICP Optimizer: analyze CLOSED_WON patterns → rewrite search queries
      const icpProfile = await ICPOptimizerAgent.optimizeICP();

      // 2. Campaign Scientist: evaluate A/B reply rates → kill loser → generate challenger
      await CampaignScientistAgent.runExperiment();

      // 3. Competitor Intel: runs weekly (every 10 cycles approx) or on first run
      const intelReports = db.getCompetitorIntelReports();
      const shouldRunIntel = intelReports.length === 0 || 
        (Date.now() - new Date(intelReports[intelReports.length - 1].timestamp).getTime()) > 1000 * 60 * 60 * 24 * 7;
      if (shouldRunIntel) {
        await CompetitorIntelAgent.runWeeklyIntelCycle();
      }

      // ========================================================
      // LEAD GENERATION — uses ICP-optimized query
      // ========================================================

      // --- Pillar 2: Lead Generation (with Self-Healing Loop) ---
      let leads: Lead[] = [];
      const searchQuery = customQuery || ICPOptimizerAgent.getBestSearchQuery();
      try {
        leads = await DataAgent.executeLeadGenCycle(searchQuery);
        scrapedCount = leads.length;
      } catch (leadError: any) {
        db.addLog('DATA', 'CYCLE_INTERRUPTED', `Orchestrator intercepted lead pipeline failure: "${leadError.message}". Redirecting to Sentinel Sentinel Agent...`, 200, 'ERROR');
        
        // Trigger self healing!
        const selfHealed = await SentinelAgent.isolateAndSelfHeal(leadError.message, leadError.stack || '');
        if (selfHealed) {
          healed = true;
          // Retry the lead generation cycle with the fresh code
          db.addLog('DATA', 'RETRYING_LEAD_GEN', 'Sentinel applied patch. Re-executing lead generation pipeline...', 200);
          leads = await DataAgent.executeLeadGenCycle();
          scrapedCount = leads.length;
        } else {
          throw leadError; // Self healing failed, bubble up error
        }
      }

      // --- Pillar 3: Outbound SDR Sequence (with Self-Healing Loop) ---
      let activeContacts: PipelineContact[] = [];
      if (leads.length > 0) {
        try {
          activeContacts = await SDRAgent.executeOutboundCycle(leads);
        } catch (sdrError: any) {
          db.addLog('SDR', 'CYCLE_INTERRUPTED', `Orchestrator intercepted SDR outbound failure: "${sdrError.message}". Redirecting to Sentinel Agent...`, 200, 'ERROR');
          
          const selfHealed = await SentinelAgent.isolateAndSelfHeal(sdrError.message, sdrError.stack || '');
          if (selfHealed) {
            healed = true;
            db.addLog('SDR', 'RETRYING_SDR_OUTBOUND', 'Sentinel applied patch for SMTP/Carrier issue. Re-executing outbound sequence...', 200);
            activeContacts = await SDRAgent.executeOutboundCycle(leads);
          } else {
            throw sdrError;
          }
        }
      }

      // Sync active contacts to HubSpot/Salesforce
      const pipeline = db.getPipeline();
      
      // Let's process each contact in the pipeline based on stage to simulate a live moving system
      for (const contact of pipeline) {
        const lead = db.getLead(contact.leadId);
        if (!lead) continue;
        // Simulate incoming objections or negotiation
        if (contact.dealStage === 'SDR_OUTBOUND' && contact.sequenceState === 'EMAIL_2') {
          // Simulate the prospect replying and the Triage Agent reading the inbox
          const triaged = await InboxTriageAgent.executeTriage(contact);
          
          if (!triaged || (contact.dealStage as string) === 'OBJECTION_HANDLING') {
            // Trigger inbound objection (simulate random customer objection) if triage sent them here
            const objections = [
              "We don't have budget for new cocktail mixer inventory this quarter.",
              "We already carry standard liquid cocktail mixers like Stirrings and Fever-Tree.",
              "Do you have retail-ready packaging and shelf display units with UPC barcodes?",
              "We are concerned about the taste of sugar-free monk fruit and allulose mixers. Do they have a bitter aftertaste?"
            ];
            const randomObjection = objections[Math.floor(Math.random() * objections.length)];
            await ObjectionAgent.handleInboundObjection(contact, randomObjection);
          }
        }
        
        // Transition from Objection handling to AE Closer Dynamic Proposals
        else if (contact.dealStage === 'OBJECTION_HANDLING') {
          await AEAgent.executeAECloser(contact);
        }

        // Verify Proposal & Close Deals via Airgoods Purchase Order Checks
        else if (contact.dealStage === 'AE_PROPOSAL') {
          // Extract inv ID from last log
          const invId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const closed = await AEAgent.checkClosingStatus(contact, invId);
          
          if (closed) {
            // --- Pillar 4: Client Onboarding ---
            await OnboardingAgent.executeOnboarding(contact);
          }
        }

        // Customer Success Assessments & Churn Prevention
        else if (contact.retentionStatus === 'ONBOARDED') {
          // Simulate some product usage activity
          contact.productUsageCount += Math.floor(Math.random() * 12) + 2;
          
          // Randomly trigger health score changes for demonstration
          const rand = Math.random();
          if (rand > 0.85) {
            contact.engagementScore = Math.max(contact.engagementScore - 40, 10); // dropped to risk
          } else if (rand > 0.5) {
            contact.engagementScore = Math.min(contact.engagementScore + 10, 100); // recovered
          }
          
          await CSAgent.executeCSAssessment(contact);
        }
      }

      // --- Pillar 4.5: Account Nurture & Reorder Check ---
      await AccountNurtureAgent.executeNurtureCheck();

      // --- Pillar 5: Daily Master Audit cron run ---
      const auditResults = await AuditAgent.executeDailyAudit();

      resetAll();
      return {
        success: true,
        healed,
        scrapedCount,
        activeDealsCount: pipeline.filter(c => c.dealStage !== 'CLOSED_WON').length,
        closedWonCount: pipeline.filter(c => c.dealStage === 'CLOSED_WON').length,
        auditResults
      };

    } catch (err: any) {
      db.addLog('SENTINEL', 'CYCLE_CRITICAL_FAILURE', `CRITICAL UNHANDLED GTM CYCLE FAILURE: ${err.message}`, 500, 'ERROR');
      resetAll();
      return {
        success: false,
        healed,
        scrapedCount,
        activeDealsCount: db.getPipeline().filter(c => c.dealStage !== 'CLOSED_WON').length,
        closedWonCount: db.getPipeline().filter(c => c.dealStage === 'CLOSED_WON').length
      };
    }
  }
}

import fs from 'fs';
import path from 'path';

// --- Database Schemas & Types ---

export interface Lead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  domain: string;
  phone: string;
  title: string;
  techStack: string[];
  intentSignals: string[];
  status: 'SCRAPED' | 'ENRICHED' | 'QUALIFIED' | 'CORRUPTED';
  createdAt: string;
}

export interface PipelineContact {
  id: string;
  leadId: string;
  dealStage: 'SDR_OUTBOUND' | 'OBJECTION_HANDLING' | 'AE_PROPOSAL' | 'CLOSED_WON' | 'CLOSED_LOST';
  dealValue: number;
  sequenceState: 'EMAIL_1' | 'EMAIL_2' | 'SMS_1' | 'LINKEDIN_1' | 'SUSPENDED' | 'COMPLETED';
  lastInteractionDate: string;
  healthScore: 'HEALTHY' | 'RISKY' | 'CHURNING';
  retentionStatus?: 'ACTIVE' | 'ONBOARDED' | 'RETAINED' | 'CHURNED' | 'REORDER_PENDING';
  engagementScore: number; // 0 - 100
  productUsageCount: number;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentName: 'DATA' | 'SDR' | 'OBJECTION' | 'AE' | 'ONBOARDING' | 'CS' | 'AUDIT' | 'SENTINEL';
  actionType: string;
  logContent: string;
  tokensUsed: number;
  status: 'SUCCESS' | 'ERROR' | 'RETRY';
}

export interface ABTest {
  id: string;
  testName: 'SUBJECT_LINE' | 'OBJECTION_STRATEGY';
  variantA: string;
  variantB: string;
  variantA_body?: string;
  variantB_body?: string;
  sendsA: number;
  sendsB: number;
  repliesA: number;
  repliesB: number;
  conversionRateA: number;
  conversionRateB: number;
  activeVariant: 'A' | 'B';
}

export interface SelfHealingLog {
  id: string;
  timestamp: string;
  componentFailed: string;
  errorDetails: string;
  patchCode: string;
  sandboxResult: 'PASS' | 'FAIL';
  deploymentStatus: 'DEPLOYED' | 'ABORTED';
  latencyMs: number;
}

export interface ICPProfile {
  id: string;
  lastUpdated: string;
  topStoreTypes: string[];
  topCities: string[];
  avgClosedValue: number;
  closedWonCount: number;
  prioritySearchQueries: string[];
  killList: string[];
  confidenceScore: number;
  insight: string;
}

export interface ScientistReport {
  id: string;
  timestamp: string;
  testId: string;
  winnerVariant: 'A' | 'B';
  killedVariant: 'A' | 'B';
  winnerConversionRate: number;
  loserConversionRate: number;
  newChallengerSubject: string;
  newChallengerBody: string;
  action: 'CHAMPION_CROWNED' | 'NEW_CHALLENGER_GENERATED' | 'INSUFFICIENT_DATA';
  insight: string;
}

export interface CompetitorWeakness {
  competitor: string;
  weaknessType: 'PACKAGING' | 'TASTE' | 'SHELF_LIFE' | 'SUGAR' | 'MARGIN' | 'SHIPPING';
  discoveredText: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InjectedObjectionOverride {
  objectionTrigger: string;
  overrideAngle: string;
  competitorMentioned: string;
}

export interface CompetitorIntelReport {
  id: string;
  timestamp: string;
  competitorsAnalyzed: string[];
  weaknesses: CompetitorWeakness[];
  injectedObjectionOverrides: InjectedObjectionOverride[];
  insight: string;
}

export interface DatabaseState {
  leads: Lead[];
  pipeline: PipelineContact[];
  logs: AgentLog[];
  abTests: ABTest[];
  selfHealing: SelfHealingLog[];
  icpProfile: ICPProfile | null;
  scientistReports: ScientistReport[];
  competitorIntelReports: CompetitorIntelReport[];
}

const DEFAULT_AB_TESTS: ABTest[] = [
  {
    id: 'ab-1',
    testName: 'SUBJECT_LINE',
    variantA: 'Premium zero-sugar Cocktail Stix wholesale - {{companyName}}',
    variantB: 'Add zero-sugar Cocktail Stix to {{companyName}}\'s beverage shelves?',
    variantA_body: `Hi {{firstName}},\n\nI noticed {{companyName}} is a leader in premium, curated beverage offerings. Given your active retail focus on {{retailFocus}}, I wanted to reach out regarding our premium, zero-sugar, zero-calorie Cocktail Stix drink mixer packets.\n\nSweetened only with monk fruit and allulose, they deliver clean, delicious flavors like Classic Margarita, Moscow Mule, Pineapple Spritz, and Raspberry Martini with absolutely zero sugar, zero calories, and zero artificial aftertaste. They are 100% keto-friendly, vegan, and all-natural. \n\nOur travel-friendly, lightweight cartons are fully retail-ready with unique UPC barcodes, offering an exceptional 45-50% gross margin on small-footprint counter displays. \n\nShall I send over a complimentary wholesale product sample kit for your team to taste next week?\n\nBest regards,\nMax Leahy\nOwner | Cocktail Stix`,
    variantB_body: `Hi {{firstName}},\n\nWould you be open to adding Cocktail Stix's zero-sugar premium mixers to {{companyName}}'s shelves? \n\nUnlike traditional liquid mixers that occupy massive counter footprints and risk breakages, our dry single-serve stick packs are lightweight, travel-friendly, and pre-barcoded with UPCs. Sweetened cleanly with monk fruit and allulose, they provide standard Margarita and Mule profiles without the sugar or bitter stevia aftertaste.\n\nWe support our specialty boutique grocer and liquor shop partners with an excellent 45% margin and high-end tabletop display counter packages.\n\nLet me know if we can ship a free wholesale sample kit to {{companyName}} next week?\n\nWarmly,\nMax Leahy\nOwner | Cocktail Stix`,
    sendsA: 0,
    sendsB: 0,
    repliesA: 0,
    repliesB: 0,
    conversionRateA: 0,
    conversionRateB: 0,
    activeVariant: 'A',
  },
  {
    id: 'ab-2',
    testName: 'OBJECTION_STRATEGY',
    variantA: 'Taste, Monk Fruit Sweetener & All-Natural Ingredients Focus',
    variantB: 'Retail-Ready UPC Packaging, High Margins & Portability Focus',
    sendsA: 0,
    sendsB: 0,
    repliesA: 0,
    repliesB: 0,
    conversionRateA: 0,
    conversionRateB: 0,
    activeVariant: 'A',
  }
];

class Database {
  private dbPath: string;
  private state: DatabaseState;

  constructor() {
    // Save inside a hidden folder in the workspace for convenience and resilience
    const dir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.dbPath = path.join(dir, 'db.json');
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          leads: parsed.leads || [],
          pipeline: parsed.pipeline || [],
          logs: parsed.logs || [],
          abTests: parsed.abTests && parsed.abTests.length > 0 ? parsed.abTests : DEFAULT_AB_TESTS,
          selfHealing: parsed.selfHealing || [],
          icpProfile: parsed.icpProfile || null,
          scientistReports: parsed.scientistReports || [],
          competitorIntelReports: parsed.competitorIntelReports || []
        };
      }
    } catch (e) {
      console.error('Error loading database, resetting...', e);
    }
    return {
      leads: [],
      pipeline: [],
      logs: [],
      abTests: DEFAULT_AB_TESTS,
      selfHealing: [],
      icpProfile: null,
      scientistReports: [],
      competitorIntelReports: []
    };
  }

  public save(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // --- API Methods ---

  // Leads
  public getLeads(): Lead[] { return this.state.leads; }
  public getLead(id: string): Lead | undefined { return this.state.leads.find(l => l.id === id); }
  public saveLead(lead: Lead): void {
    const idx = this.state.leads.findIndex(l => l.id === lead.id);
    if (idx >= 0) this.state.leads[idx] = lead;
    else this.state.leads.push(lead);
    this.save();
  }

  // Pipeline Contacts
  public getPipeline(): PipelineContact[] { return this.state.pipeline; }
  public getPipelineContact(id: string): PipelineContact | undefined {
    return this.state.pipeline.find(p => p.id === id || p.leadId === id);
  }
  public savePipelineContact(contact: PipelineContact): void {
    const idx = this.state.pipeline.findIndex(p => p.id === contact.id);
    if (idx >= 0) this.state.pipeline[idx] = contact;
    else this.state.pipeline.push(contact);
    this.save();
  }

  // Agent Logs
  public getLogs(): AgentLog[] { return this.state.logs; }
  public addLog(agentName: AgentLog['agentName'], actionType: string, logContent: string, tokensUsed: number, status: AgentLog['status'] = 'SUCCESS'): AgentLog {
    const newLog: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agentName,
      actionType,
      logContent,
      tokensUsed,
      status
    };
    this.state.logs.push(newLog);
    // Keep logs size reasonable (cap at last 1000 logs)
    if (this.state.logs.length > 1000) {
      this.state.logs.shift();
    }
    this.save();
    return newLog;
  }

  // A/B Tests
  public getABTests(): ABTest[] { return this.state.abTests; }
  public updateABTest(test: ABTest): void {
    const idx = this.state.abTests.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      this.state.abTests[idx] = test;
      this.save();
    }
  }

  // Self Healing Logs
  public getSelfHealingLogs(): SelfHealingLog[] { return this.state.selfHealing; }
  public addSelfHealingLog(log: Omit<SelfHealingLog, 'id' | 'timestamp'>): SelfHealingLog {
    const newLog: SelfHealingLog = {
      id: `heal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.state.selfHealing.push(newLog);
    this.save();
    return newLog;
  }

  // ICP Optimizer Agent
  public getICPProfile(): ICPProfile | null { return this.state.icpProfile; }
  public saveICPProfile(profile: ICPProfile): void {
    this.state.icpProfile = profile;
    this.save();
  }

  // Campaign Scientist Agent
  public getScientistReports(): ScientistReport[] { return this.state.scientistReports; }
  public addScientistReport(report: ScientistReport): void {
    this.state.scientistReports.push(report);
    // Keep last 50 reports
    if (this.state.scientistReports.length > 50) {
      this.state.scientistReports.shift();
    }
    this.save();
  }

  // Competitor Intel Agent
  public getCompetitorIntelReports(): CompetitorIntelReport[] { return this.state.competitorIntelReports; }
  public getLatestCompetitorIntelReport(): CompetitorIntelReport | null {
    if (this.state.competitorIntelReports.length === 0) return null;
    return this.state.competitorIntelReports[this.state.competitorIntelReports.length - 1];
  }
  public saveCompetitorIntelReport(report: CompetitorIntelReport): void {
    this.state.competitorIntelReports.push(report);
    // Keep last 20 intel reports
    if (this.state.competitorIntelReports.length > 20) {
      this.state.competitorIntelReports.shift();
    }
    this.save();
  }

  // Reset/Clear for testing
  public clear(): void {
    this.state = {
      leads: [],
      pipeline: [],
      logs: [],
      abTests: DEFAULT_AB_TESTS,
      selfHealing: [],
      icpProfile: null,
      scientistReports: [],
      competitorIntelReports: []
    };
    this.save();
  }
}

export const db = new Database();

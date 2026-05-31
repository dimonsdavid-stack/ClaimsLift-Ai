'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  Coins,
  ShieldCheck,
  RefreshCw,
  Play,
  Users,
  CheckCircle2,
  MailOpen,
  HelpCircle,
  Database,
  ArrowRight,
  ChevronRight,
  Bug,
  AlertTriangle,
  Zap,
  Check,
  MapPin,
  Star,
  Mail,
  BookOpen,
  Layers,
  Globe,
  Phone,
  Settings,
  ChevronDown
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>({
    leads: [],
    pipeline: [],
    logs: [],
    abTests: [],
    selfHealing: [],
    settings: {
      hasApolloKey: false,
      hasGooglePlacesKey: false,
      isLiveSmtp: false,
      gmailUser: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [errorTypeToInject, setErrorTypeToInject] = useState<string | null>(null);
  const [cyclesRun, setCyclesRun] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Idle');
  
  const [apolloInput, setApolloInput] = useState('');
  const [googlePlacesInput, setGooglePlacesInput] = useState('');
  const [openAIInput, setOpenAIInput] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'places' | 'outbox' | 'objections' | 'templates' | 'intelligence'>('pipeline');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Custom states for client-facing interactivity
  const [searchCity, setSearchCity] = useState('Miami Beach, FL');
  const [searchCategory, setSearchCategory] = useState('boutique liquor wine spirits store');
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);

  // Template customizer states
  const [variantA_Subject, setVariantA_Subject] = useState('');
  const [variantB_Subject, setVariantB_Subject] = useState('');
  const [variantA_Body, setVariantA_Body] = useState('');
  const [variantB_Body, setVariantB_Body] = useState('');

  // Accordion toggle for Developer self-healing verification console
  const [showDevDiagnostics, setShowDevDiagnostics] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch telemetry from API
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/gtm');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Error fetching telemetry', e);
    }
  };

  // Synchronize dynamic campaign template details
  useEffect(() => {
    if (data.abTests && data.abTests.length > 0) {
      const subjectTest = data.abTests.find((t: any) => t.testName === 'SUBJECT_LINE');
      if (subjectTest) {
        setVariantA_Subject(subjectTest.variantA);
        setVariantB_Subject(subjectTest.variantB);
        setVariantA_Body(subjectTest.variantA_body || '');
        setVariantB_Body(subjectTest.variantB_body || '');
      }
    }
  }, [data.abTests]);

  // Auto-focus first email when it arrives
  useEffect(() => {
    if (data.outbox && data.outbox.length > 0) {
      if (!selectedEmail || !data.outbox.some((e: any) => e.id === selectedEmail.id)) {
        setSelectedEmail(data.outbox[0]);
      }
    }
  }, [data.outbox, selectedEmail]);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Save Apollo key
  const handleSaveApolloKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apolloInput.trim()) return;
    setSavingKeys(true);
    setStatusMessage('Connecting Apollo API key...');
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_KEYS',
          apolloApiKey: apolloInput.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage('Apollo API key successfully saved and live-connected!');
        setApolloInput('');
        await fetchTelemetry();
      } else {
        setStatusMessage('Failed to save Apollo key: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatusMessage('Error connecting Apollo API key: ' + err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  // Save Google Places key
  const handleSaveGooglePlacesKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googlePlacesInput.trim()) return;
    setSavingKeys(true);
    setStatusMessage('Connecting Google Places API key...');
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_KEYS',
          googlePlacesApiKey: googlePlacesInput.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage('Google Places API key successfully saved and live-connected!');
        setGooglePlacesInput('');
        await fetchTelemetry();
      } else {
        setStatusMessage('Failed to save Google Places key: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatusMessage('Error connecting Google Places API key: ' + err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  // Save OpenAI key
  const handleSaveOpenAIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openAIInput.trim()) return;
    setSavingKeys(true);
    setStatusMessage('Connecting OpenAI API key for AI email generation...');
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_KEYS',
          openAIApiKey: openAIInput.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage('OpenAI GPT-4o key connected! Emails will now be AI-generated.');
        setOpenAIInput('');
        await fetchTelemetry();
      } else {
        setStatusMessage('Failed to save OpenAI key: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatusMessage('Error connecting OpenAI API key: ' + err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  // Toggle SMTP lock
  const handleToggleLiveSmtp = async (currentLiveVal: boolean) => {
    setSavingKeys(true);
    const newLiveVal = !currentLiveVal;
    
    if (newLiveVal) {
      const confirm = window.confirm("WARNING: Activating GMAIL live dispatch will bypass the safe outbox lock. Real wholesale emails will be dispatched to the contacts when clicking 'Execute Loop'. Are you sure you want to proceed?");
      if (!confirm) {
        setSavingKeys(false);
        return;
      }
    }
    
    setStatusMessage(newLiveVal ? 'Unlocking outbound emails...' : 'Locking outbound emails...');
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_KEYS',
          liveSmtp: newLiveVal
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage(`Outbox live email mode successfully set to ${newLiveVal ? 'LIVE DISPATCH' : 'SAFE SANDBOX LOCK'}`);
        await fetchTelemetry();
      }
    } catch (err: any) {
      setStatusMessage('Error toggling live SMTP status: ' + err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  // Custom lead search trigger
  const triggerCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingLeads(true);
    setLoading(true);
    const query = `${searchCategory} in ${searchCity}`;
    setStatusMessage(`Scraping Google Places for real-time leads: "${query}"...`);
    
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RUN_STEP',
          customQuery: query
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage(`Successfully scraped and matched ${result.scrapedCount || 0} leads matching: "${query}"!`);
        setCyclesRun(prev => prev + 1);
        await fetchTelemetry();
      } else {
        setStatusMessage('Search failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatusMessage('Error executing search: ' + err.message);
    } finally {
      setIsSearchingLeads(false);
      setLoading(false);
    }
  };

  // Campaign templates saver
  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setStatusMessage('Saving custom campaign templates...');
    
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_AB_TESTS',
          abTests: [
            {
              id: 'ab-1',
              variantA: variantA_Subject,
              variantB: variantB_Subject,
              variantA_body: variantA_Body,
              variantB_body: variantB_Body
            }
          ]
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage('Campaign A/B pitch templates updated successfully!');
        await fetchTelemetry();
      } else {
        setStatusMessage('Failed to save templates: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatusMessage('Error saving templates: ' + err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  // Auto-scroll agent logs console
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data.logs]);

  // Continuous execution polling
  useEffect(() => {
    let interval: any;
    if (polling) {
      interval = setInterval(() => {
        handleRunStep();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [polling]);

  const handleRunStep = async (injectedError?: string) => {
    setLoading(true);
    setStatusMessage('Orchestrator invoking specialized agents...');
    try {
      const res = await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RUN_STEP',
          errorType: injectedError || null
        })
      });
      const result = await res.json();
      
      if (result.success) {
        if (result.healed) {
          setStatusMessage('System self-healed successfully & cycle completed.');
        } else {
          setStatusMessage('GTM multi-agent cycle completed.');
        }
        setCyclesRun(prev => prev + 1);
      } else {
        setStatusMessage('Pipeline crashed. Sentinel isolation triggered.');
      }
      await fetchTelemetry();
    } catch (e) {
      console.error(e);
      setStatusMessage('Simulation communications failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setStatusMessage('Purging database...');
    try {
      await fetch('/api/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' })
      });
      setStatusMessage('Environment purged. Ready.');
      setCyclesRun(0);
      await fetchTelemetry();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for stats
  const totalPipelineValue = data.pipeline.reduce((sum: number, c: any) => sum + (c.dealValue || 0), 0);
  const closedWonDeals = data.pipeline.filter((c: any) => c.dealStage === 'CLOSED_WON');
  const closedWonValue = closedWonDeals.reduce((sum: number, c: any) => sum + (c.dealValue || 0), 0);
  
  const totalTokens = data.logs.reduce((sum: number, l: any) => sum + (l.tokensUsed || 0), 0);
  const healCount = data.selfHealing.length;
  
  // Pipeline categorization
  const stageScraped = data.leads.filter((l: any) => l.status === 'ENRICHED');
  const stageSDR = data.pipeline.filter((c: any) => c.dealStage === 'SDR_OUTBOUND');
  const stageObjection = data.pipeline.filter((c: any) => c.dealStage === 'OBJECTION_HANDLING');
  const stageProposal = data.pipeline.filter((c: any) => c.dealStage === 'AE_PROPOSAL');
  const stageClosed = data.pipeline.filter((c: any) => c.dealStage === 'CLOSED_WON');

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400 glow-teal" />
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">COCKTAIL STIX GTM</h1>
            <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-md font-mono uppercase">Orchestration Active</span>
          </div>
          <p className="text-sm text-gray-400">Autonomous Pre-GTM Multi-Agent Sales & Retention Command Center</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => handleReset()}
            className="px-4 py-2 text-xs font-medium rounded-lg glass-panel hover:bg-red-500/10 hover:border-red-500/30 text-gray-300 transition-all flex items-center gap-2 cursor-pointer"
            disabled={loading}
          >
            <Database size={14} className="text-red-400" />
            Reset Data
          </button>

          <button
            onClick={() => setPolling(!polling)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all border ${
              polling 
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 glow-teal' 
                : 'glass-panel text-gray-300 hover:border-white/20'
            }`}
          >
            <RefreshCw size={14} className={polling ? 'animate-spin' : ''} />
            {polling ? 'Auto-Polling ON (4s)' : 'Enable Continuous Run'}
          </button>

          <button
            onClick={() => handleRunStep()}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 flex items-center gap-2 transition-all cursor-pointer"
            disabled={loading}
          >
            <Play size={14} fill="white" />
            Execute Loop
          </button>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 text-xs font-medium rounded-lg glass-panel hover:bg-white/10 hover:border-white/20 text-gray-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings size={14} className="text-gray-400" />
            Settings
          </button>
        </div>
      </header>

      {/* CREDENTIALS & INTEGRATIONS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowSettingsModal(false)}></div>
          <section className="glass-panel p-6 rounded-xl border border-white/10 bg-[#0a0a0a] max-w-3xl w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              Close
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5 pr-16">
              <div className="flex items-center gap-2.5">
                <Zap size={18} className="text-teal-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">System Status & Controls</h2>
                  <p className="text-xs text-gray-400">All integrations are pre-configured and active. Manage email dispatch settings below.</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            {/* OpenAI Status Badge */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
              <span className="text-gray-400">AI Email Writer:</span>
              {data.settings?.hasOpenAIKey ? (
                <span className="flex items-center gap-1.5 text-green-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 glow-teal animate-pulse" />
                  GPT-4o ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-violet-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  SMART TEMPLATE
                </span>
              )}
            </div>

            {/* Apollo Status Badge */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
              <span className="text-gray-400">Apollo API:</span>
              {data.settings?.hasApolloKey ? (
                <span className="flex items-center gap-1.5 text-green-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 glow-teal animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  STANDBY (Sandbox)
                </span>
              )}
            </div>

            {/* Google Places Status Badge */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
              <span className="text-gray-400">Google Places:</span>
              {data.settings?.hasGooglePlacesKey ? (
                <span className="flex items-center gap-1.5 text-green-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 glow-teal animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  STANDBY (Sandbox)
                </span>
              )}
            </div>

            {/* Email Lock Status Badge */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
              <span className="text-gray-400">Sequence Lock:</span>
              {data.settings?.isLiveSmtp ? (
                <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                  SMTP DISPATCH LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-teal-400 font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 glow-teal" />
                  SAFE SANDBOX ENABLED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Outbox Safe Lock Override Box */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Outbox Dispatch Controller</h3>
              <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                Outbox is configured to route simulated mails for <strong>{data.settings?.gmailUser}</strong>.
                Live SMTP transmission is strictly blocked under sandbox settings by default.
              </p>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Live Email Dispatch Lock</span>
                <span className="text-[10px] text-gray-400">Currently: {data.settings?.isLiveSmtp ? 'Live and transmitting' : 'Safely sandboxed'}</span>
              </div>
              
              <button
                onClick={() => handleToggleLiveSmtp(data.settings?.isLiveSmtp)}
                className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                  data.settings?.isLiveSmtp 
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 shadow-lg shadow-red-500/10' 
                    : 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30'
                }`}
                disabled={savingKeys}
              >
                {data.settings?.isLiveSmtp ? 'Lock Outbox (Sandbox)' : 'Unlock Live Dispatch'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    )}

    {/* SYSTEM METRICS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total Pipeline Value</p>
            <h3 className="text-2xl font-bold text-white">${totalPipelineValue.toLocaleString()}</h3>
            <p className="text-xs text-teal-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              Wholesale Pipeline target
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Activity size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Closed-Won Deals</p>
            <h3 className="text-2xl font-bold text-white">${closedWonValue.toLocaleString()}</h3>
            <p className="text-xs text-violet-400 font-medium flex items-center gap-1 mt-1">
              <Users size={12} />
              {closedWonDeals.length} retailer accounts shipped
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">LLM Token Efficiency</p>
            <h3 className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
              <Coins size={12} />
              Avg cost optimized
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Coins size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Sentinel Auto-Heals</p>
            <h3 className="text-2xl font-bold text-white">{healCount}</h3>
            <p className="text-xs text-green-400 font-medium flex items-center gap-1 mt-1">
              <ShieldCheck size={12} />
              100% self-repaired
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <ShieldCheck size={20} />
          </div>
        </div>
      </section>


      {/* DASHBOARD KANBAN PIPELINE — FULL WIDTH */}
      <section className="flex flex-col gap-6">
        {/* Tabs Section - Full Width */}
        <div className="flex flex-col gap-6">
          {/* TABS NAVIGATION */}
          <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/30 shadow-md shadow-violet-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Layers size={14} />
              Outreach Pipeline & CS
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'places'
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/30 shadow-md shadow-violet-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <MapPin size={14} />
              Google Places Discovery
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'outbox'
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/30 shadow-md shadow-violet-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Mail size={14} />
              Mail Outbox ({data.outbox?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/30 shadow-md shadow-violet-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <MailOpen size={14} />
              SDR Campaigns & Templates
            </button>
            <button
              onClick={() => setActiveTab('objections')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'objections'
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/30 shadow-md shadow-violet-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <BookOpen size={14} />
              Objection Battlecards
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'intelligence'
                  ? 'bg-gradient-to-r from-rose-600/30 to-orange-600/30 text-white border border-rose-500/30 shadow-md shadow-rose-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Zap size={14} />
              Self-Improving Agents
            </button>
          </div>

          {/* TAB 1: PIPELINE & CS KANBAN */}
          {activeTab === 'pipeline' && (
            <>
              <div className="glass-panel p-6 rounded-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-teal-400" />
                  GTM Sales Pipeline
                </h2>

                <div className="grid grid-cols-5 gap-3 h-96 overflow-y-auto">
                  {/* Col 1 */}
                  <div className="bg-white/2 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">1. Enriched</span>
                      <span className="text-xs text-white font-semibold font-mono">{stageScraped.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
                      {stageScraped.map((l: any) => (
                        <div key={l.id} className="p-2 rounded bg-white/5 border border-white/5 text-[11px] flex flex-col gap-1">
                          <p className="font-bold text-white truncate">{l.firstName} {l.lastName}</p>
                          <p className="text-gray-400 truncate">{l.companyName}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {l.techStack.slice(0, 2).map((t: string) => (
                              <span key={t} className="bg-violet-500/10 text-violet-300 text-[8px] px-1 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="bg-white/2 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-teal-400 uppercase">2. Outbound</span>
                      <span className="text-xs text-teal-300 font-semibold font-mono">{stageSDR.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
                      {stageSDR.map((c: any) => {
                        const lead = data.leads.find((l: any) => l.id === c.leadId);
                        return (
                          <div key={c.id} className="p-2 rounded bg-teal-500/5 border border-teal-500/10 text-[11px] flex flex-col gap-1">
                            <p className="font-bold text-white truncate">{lead?.firstName} {lead?.lastName}</p>
                            <p className="text-gray-400 truncate">{lead?.companyName}</p>
                            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 py-0.5 rounded-md font-mono self-start mt-1 uppercase">{c.sequenceState}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 3 */}
                  <div className="bg-white/2 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">3. Objection</span>
                      <span className="text-xs text-amber-300 font-semibold font-mono">{stageObjection.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
                      {stageObjection.map((c: any) => {
                        const lead = data.leads.find((l: any) => l.id === c.leadId);
                        return (
                          <div key={c.id} className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-[11px] flex flex-col gap-1">
                            <p className="font-bold text-white truncate">{lead?.firstName} {lead?.lastName}</p>
                            <p className="text-gray-400 truncate">{lead?.companyName}</p>
                            <span className="text-[8px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
                              <AlertTriangle size={10} />
                              Objection...
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 4 */}
                  <div className="bg-white/2 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-violet-400 uppercase">4. Proposal</span>
                      <span className="text-xs text-violet-300 font-semibold font-mono">{stageProposal.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
                      {stageProposal.map((c: any) => {
                        const lead = data.leads.find((l: any) => l.id === c.leadId);
                        return (
                          <div key={c.id} className="p-2 rounded bg-violet-500/5 border border-violet-500/10 text-[11px] flex flex-col gap-1">
                            <p className="font-bold text-white truncate">{lead?.firstName} {lead?.lastName}</p>
                            <p className="text-gray-400 truncate">{lead?.companyName}</p>
                            <p className="text-white font-mono font-bold mt-1">${c.dealValue.toLocaleString()}</p>
                            <span className="text-[8px] text-violet-400 font-semibold uppercase">Invoice Sent</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 5 */}
                  <div className="bg-white/2 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-green-400 uppercase">5. Closed-Won</span>
                      <span className="text-xs text-green-300 font-semibold font-mono">{stageClosed.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
                      {stageClosed.map((c: any) => {
                        const lead = data.leads.find((l: any) => l.id === c.leadId);
                        return (
                          <div key={c.id} className="p-2 rounded bg-green-500/5 border border-green-500/10 text-[11px] flex flex-col gap-1 relative overflow-hidden">
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-bl-sm" />
                            <p className="font-bold text-white truncate">{lead?.firstName} {lead?.lastName}</p>
                            <p className="text-gray-400 truncate">{lead?.companyName}</p>
                            <p className="text-white font-mono font-bold mt-1">${c.dealValue.toLocaleString()}</p>
                            <div className="flex items-center gap-1 mt-1 text-[8px] text-green-400 uppercase font-semibold">
                              <Check size={10} />
                              Active Shipped
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retention & CS Monitor Panel */}
              <div className="glass-panel p-6 rounded-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={18} className="text-violet-400" />
                  CS Stock Retention & Sell-Through Velocity Monitor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stageClosed.length === 0 ? (
                    <div className="col-span-2 p-6 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl bg-black/10">
                      No active wholesale retailer accounts shipped yet. Close some deals to start stock velocity assessment.
                    </div>
                  ) : (
                    stageClosed.map((c: any) => {
                      const lead = data.leads.find((l: any) => l.id === c.leadId);
                      const isHealthy = c.healthScore === 'HEALTHY';
                      const isRisky = c.healthScore === 'RISKY';
                      
                      return (
                        <div key={c.id} className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-white">{lead?.companyName}</h4>
                              <p className="text-[10px] text-gray-400">{lead?.email}</p>
                            </div>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              isHealthy ? 'bg-green-500/10 text-green-300' :
                              isRisky ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                              'bg-red-500/10 text-red-300 border border-red-500/20 animate-pulse'
                            }`}>
                              {c.healthScore}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-400">Sell-Through Velocity Events</span>
                              <span className="text-white font-bold">{c.productUsageCount} events</span>
                            </div>
                            <div className="flex justify-between text-[10px] items-center">
                              <span className="text-gray-400">Stock Velocity</span>
                              <span className="text-white font-mono">{c.engagementScore}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isHealthy ? 'bg-green-400' : isRisky ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${c.engagementScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
          {activeTab === 'places' && (
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-teal-400" />
                  <h2 className="text-lg font-bold text-white">Google Places Local Lead Discovery</h2>
                </div>
                <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono uppercase font-bold">Physical Finder</span>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed mb-1">
                The Google Places API extracts local retail storefronts. We map and enrich their digital domains via Apollo to match wine & spirits beverage category buyers instantly.
              </p>

              {/* Interactive Target Search Console */}
              <form onSubmit={triggerCustomSearch} className="bg-black/30 p-4 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Retail City / Area</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Miami Beach, FL or Los Angeles"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wholesale Category Target</label>
                  <select 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-all w-full cursor-pointer"
                  >
                    <option value="boutique liquor wine spirits store">🍸 Specialty Liquor & Wine Boutiques</option>
                    <option value="luxury hotel resort retail mini-bar">🏨 Luxury Resorts & Poolside Retail</option>
                    <option value="specialty grocery organic market">🛒 Gourmet & Organic Food Markets</option>
                    <option value="beach yacht cocktail lounge">⛵ Yacht Clubs & Premium Lounges</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-teal-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  disabled={loading}
                >
                  {isSearchingLeads ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Scraping & Enriching...
                    </>
                  ) : (
                    <>
                      <Zap size={14} fill="currentColor" />
                      Scan Local Retail Targets
                    </>
                  )}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ...(data.leads || []).map((l: any) => {
                    const addressSig = l.intentSignals?.find((s: string) => s.startsWith('Google Places Location:') || s.startsWith('Google Places Verified Location:')) || '';
                    const cleanAddress = addressSig.replace('Google Places Location: ', '').replace('Google Places Verified Location: ', '') || 'United States';
                    
                    const ratingSig = l.intentSignals?.find((s: string) => s.startsWith('Store Rating:')) || '';
                    const cleanRating = parseFloat(ratingSig.replace('Store Rating: ', '').split('/')[0]) || 4.7;

                    return {
                      name: l.companyName,
                      address: cleanAddress,
                      phone: l.phone || '+1 Wholesale Direct',
                      website: l.domain ? `https://${l.domain}` : 'https://cocktailstix.com',
                      domain: l.domain || 'unknown.com',
                      rating: cleanRating,
                      contact: `${l.firstName} ${l.lastName}`,
                      role: l.title || 'Beverage Category Buyer',
                      email: l.email,
                      isReal: true
                    };
                  }),
                  ...((data.leads || []).length === 0 ? [
                    {
                      name: 'Green Leaf Gourmet Market - West Hollywood',
                      address: '8500 Santa Monica Blvd, West Hollywood, CA 90069',
                      phone: '+1 310-555-9812',
                      website: 'https://greenleafgourmet.com',
                      domain: 'greenleafgourmet.com',
                      rating: 4.7,
                      contact: 'Marcus Sterling',
                      role: 'Specialty Beverage Category Manager',
                      email: 'marcus.sterling@greenleafgourmet.com'
                    },
                    {
                      name: 'Heritage Wine & Spirits',
                      address: '9400 Olympic Blvd, Beverly Hills, CA 90212',
                      phone: '+1 310-555-3489',
                      website: 'https://heritagespirits.com',
                      domain: 'heritagespirits.com',
                      rating: 4.9,
                      contact: 'Sophia Bennett',
                      role: 'Owner & Head Buyer',
                      email: 'sophia.bennett@heritagespirits.com'
                    },
                    {
                      name: 'Urban Transit Gourmet Markets - Grand Central',
                      address: '89 E 42nd St, New York, NY 10017',
                      phone: '+1 212-555-7865',
                      website: 'https://urbantransit.com',
                      domain: 'urbantransit.com',
                      rating: 4.5,
                      contact: 'Devon Miller',
                      role: 'Director of Retail Merchandising',
                      email: 'devon.miller@urbantransit.com'
                    },
                    {
                      name: 'Meridian Resort & Spa Poolside Retail',
                      address: '4400 Collins Ave, Miami Beach, FL 33140',
                      phone: '+1 305-555-4312',
                      website: 'https://meridianluxuryresorts.com',
                      domain: 'meridianluxuryresorts.com',
                      rating: 4.8,
                      contact: 'Clarissa Vance',
                      role: 'Director of F&B Retail & Mini-Bar Procurement',
                      email: 'clarissa.vance@meridianluxuryresorts.com'
                    },
                    {
                      name: 'Velvet & Vine Lifestyle Boutiques',
                      address: '1200 S Congress Ave, Austin, TX 78704',
                      phone: '+1 512-555-6701',
                      website: 'https://velvetandvine.com',
                      domain: 'velvetandvine.com',
                      rating: 4.6,
                      contact: 'Julian Cross',
                      role: 'Lead Curator & Owner',
                      email: 'julian.cross@velvetandvine.com'
                    }
                  ] : [])
                ].map((store: any, idx) => {
                  const isMatched = data.leads?.some((l: any) => l.domain === store.domain);
                  
                  return (
                    <div key={idx} className="p-4 bg-white/2 rounded-xl border border-white/5 flex flex-col justify-between gap-4 hover:border-teal-500/20 hover:bg-white/5 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div>
                            <h4 className="text-xs font-bold text-white leading-snug">{store.name}</h4>
                            {store.isReal && (
                              <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1 py-0.5 rounded-sm font-mono font-bold mt-1 inline-block uppercase">REAL-TIME MATCHED</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] shrink-0 font-bold font-mono">
                            <Star size={10} fill="currentColor" />
                            {store.rating}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-[10px] text-gray-400 mt-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin size={11} className="text-gray-500 shrink-0" />
                            {store.address}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone size={11} className="text-gray-500 shrink-0" />
                            {store.phone}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Globe size={11} className="text-gray-500 shrink-0" />
                            <a href={store.website} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">{store.domain}</a>
                          </span>
                        </div>
                      </div>
 
                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2 bg-black/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">Apollo B2B Lookup:</span>
                          {isMatched ? (
                            <span className="text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase">Matched & Sequenced</span>
                          ) : (
                            <span className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase">Standby</span>
                          )}
                        </div>
 
                        <div className="text-[10px]">
                          <p className="text-white font-bold">{store.contact}</p>
                          <p className="text-[9px] text-gray-400 truncate">{store.role}</p>
                          <p className="text-[9px] text-teal-300 font-mono mt-0.5 truncate">{store.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATED MAIL OUTBOX INSPECTOR */}
          {activeTab === 'outbox' && (
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-teal-400" />
                  <h2 className="text-lg font-bold text-white">Outbound Communications Outbox Inspector</h2>
                </div>
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono uppercase font-bold">Mail Queue</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">
                This is a secure preview console displaying outbound emails drafted by the SDR and AE Agents before SMTP dispatch.
              </p>

              {!data.outbox || data.outbox.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl bg-black/10">
                  Awaiting outbound sequence execution. Click **"Execute Loop"** above to scraper leads and dispatch emails.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[350px]">
                  {/* Left Column - Mail items list */}
                  <div className="md:col-span-1 border-r border-white/5 pr-2 flex flex-col gap-2 overflow-y-auto max-h-[350px] scrollbar-thin">
                    {data.outbox.map((mail: any) => {
                      const isActive = selectedEmail && selectedEmail.id === mail.id;
                      return (
                        <button
                          key={mail.id}
                          onClick={() => setSelectedEmail(mail)}
                          className={`p-3 rounded-lg text-left transition-all border text-xs cursor-pointer flex flex-col gap-1 w-full ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-violet-500/30'
                              : 'bg-white/2 border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between text-[9px] text-gray-500 w-full">
                            <span className="truncate">{new Date(mail.sentAt).toLocaleTimeString()}</span>
                            <span className="bg-teal-500/20 text-teal-300 px-1 rounded-sm text-[8px] font-mono">SENT</span>
                          </div>
                          <p className="font-bold text-white truncate w-full">{mail.to}</p>
                          <p className="text-gray-400 truncate w-full">{mail.subject}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column - visual preview card */}
                  <div className="md:col-span-2 flex flex-col gap-4 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
                    {selectedEmail ? (
                      <div className="flex flex-col gap-3">
                        <div className="border-b border-white/5 pb-2 text-[11px] flex flex-col gap-1 text-gray-400">
                          <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                            <span>ID: {selectedEmail.id}</span>
                            <span>TIME: {new Date(selectedEmail.sentAt).toLocaleString()}</span>
                          </div>
                          <p><strong className="text-gray-300">From:</strong> Cocktail Stix Wholesale &lt;{data.settings?.gmailUser || 'cocktailstix@cocktailstix.net'}&gt;</p>
                          <p><strong className="text-gray-300">To:</strong> {selectedEmail.to}</p>
                          <p><strong className="text-gray-300">Subject:</strong> {selectedEmail.subject}</p>
                        </div>

                        {/* Rich HTML display */}
                        <div className="bg-[#0b0c10] border border-white/5 rounded-lg p-4 flex flex-col gap-4 leading-relaxed font-sans text-[11px] text-gray-200">
                          <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                            <span className="font-mono text-xs font-black tracking-widest text-teal-400 uppercase">COCKTAIL STIX</span>
                            <span className="text-[8px] bg-teal-500/10 text-teal-400 px-1.5 rounded-sm uppercase">Wholesale Inquiry</span>
                          </div>
                          <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
                          <div className="border-t border-white/5 pt-2 flex justify-between text-[9px] text-gray-500">
                            <span>© 2026 Cocktail Stix Wholesale Inc.</span>
                            <span>Unsubscribe • Manage Preferences</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-center my-auto">Select a message from the queue list to inspect outreach copy.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SDR CAMPAIGNS & TEMPLATE CUSTOMIZER */}
          {activeTab === 'templates' && (
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <MailOpen size={18} className="text-teal-400" />
                  <h2 className="text-lg font-bold text-white">Dynamic SDR Outreach Pitch Customizer</h2>
                </div>
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono uppercase font-bold">Campaign Editor</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Customize the outbound A/B subjects and pitch variables sent by the SDR outreach agent. Changes are immediately loaded in-memory and synchronized persistently.
              </p>

              {/* Placeholders cheat sheet */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Dynamic Personalization Tokens</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1.5"><code className="text-violet-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">{"{{firstName}}"}</code> Recipient's First Name</span>
                  <span className="flex items-center gap-1.5"><code className="text-violet-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">{"{{companyName}}"}</code> Store, Grocer, or Hotel Name</span>
                  <span className="flex items-center gap-1.5"><code className="text-violet-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">{"{{retailFocus}}"}</code> Google Places niche signal</span>
                </div>
              </div>

              <form onSubmit={handleSaveTemplates} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Variant A Card */}
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Campaign Variant A: Value & Ingredients</span>
                      <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono uppercase">ROI & Sweeteners</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email Subject Line</label>
                      <input 
                        type="text"
                        value={variantA_Subject}
                        onChange={(e) => setVariantA_Subject(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all w-full"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email Body Pitch Template</label>
                      <textarea 
                        rows={11}
                        value={variantA_Body}
                        onChange={(e) => setVariantA_Body(e.target.value)}
                        className="bg-[#0c0d12] border border-white/10 rounded-lg p-3 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all w-full font-sans leading-relaxed scrollbar-thin resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Variant B Card */}
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Campaign Variant B: Retail & Portability</span>
                      <span className="text-[9px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded font-mono uppercase">UPC & Display Kit</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email Subject Line</label>
                      <input 
                        type="text"
                        value={variantB_Subject}
                        onChange={(e) => setVariantB_Subject(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all w-full"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email Body Pitch Template</label>
                      <textarea 
                        rows={11}
                        value={variantB_Body}
                        onChange={(e) => setVariantB_Body(e.target.value)}
                        className="bg-[#0c0d12] border border-white/10 rounded-lg p-3 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all w-full font-sans leading-relaxed scrollbar-thin resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-end w-full sm:w-auto"
                  disabled={savingKeys}
                >
                  {savingKeys ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Deploying Pitch Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} fill="currentColor" className="text-violet-200" />
                      Save & Deploy Campaign Pitch
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: OBJECTION BATTLECARDS */}
          {activeTab === 'objections' && (
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-teal-400" />
                  <h2 className="text-lg font-bold text-white">AI SDR Objection Handling Playbook</h2>
                </div>
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono uppercase font-bold">Response Battlecards</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                These are the dynamic wholesale closing rules activated within the AI Objection Agent to handle incoming physical retail procurement objections.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: '1. Liquid Mixers Competition',
                    icon: <Activity size={14} className="text-teal-400" />,
                    objection: '"Liquid mixers are traditional and popular. Why carry powder packets?"',
                    strategy: 'Lightweight & unbreakable vs liquid! Liquid mixers suffer from shipping breakages, expensive delivery weights, and occupy huge shelf footprints. Stix display cartons occupy 70% less counter space and offer a longer shelf life.'
                  },
                  {
                    title: '2. Natural Sweeteners Taste Profile',
                    icon: <Star size={14} className="text-amber-400" />,
                    objection: '"Do monk fruit and allulose mixers leave a chemical bitter aftertaste?"',
                    strategy: 'Clean-label sweetness! Explain that our custom blend contains zero artificial sweeteners (no erythritol, stevia, or chemical back-notes). It delivers a pure natural flavour matching high-end cocktails exactly.'
                  },
                  {
                    title: '3. Premium Wholesale Margins',
                    icon: <Coins size={14} className="text-yellow-400" />,
                    objection: '"What profit margins do we get compared to standard mixers?"',
                    strategy: 'Highly lucrative margin layout! Carton tier packages generate a massive 45% to 58% gross margin for retailers, significantly beating standard canned or bottled mixer margins of 20-30%.'
                  },
                  {
                    title: '4. Retail Impulse & POS Integration',
                    icon: <CheckCircle2 size={14} className="text-green-400" />,
                    objection: '"How do we track and scan these at our checkouts?"',
                    strategy: 'Turnkey POS integration! All small-footprint display stands are pre-loaded with retail-ready packets pre-barcoded with standard UPC barcodes. Fits checkouts perfectly to drive high-margin impulse sales.'
                  }
                ].map((card, idx) => (
                  <div key={idx} className="p-4 bg-white/2 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      {card.icon}
                      <h4 className="text-xs font-bold text-white">{card.title}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] text-red-300 italic font-mono mb-2">{card.objection}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{card.strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

          {/* A/B Campaign Metrics moved directly underneath Kanban Pipeline tabs */}
          <div className="glass-panel p-6 rounded-xl mt-6 border border-white/5">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <MailOpen size={16} className="text-teal-400" />
              SDR A/B Copy Optimization
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.abTests.map((t: any) => (
                <div key={t.id} className="p-4 bg-white/2 rounded-xl flex flex-col gap-4 border border-white/5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">{t.testName}</span>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-1 rounded-md font-mono font-bold">
                      Active: Variant {t.activeVariant}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Variant A */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Variant A (ROI & Value)</span>
                        <span className="text-white font-semibold font-mono">{t.sendsA} sends / {t.conversionRateA.toFixed(1)}% replies</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${Math.min(t.conversionRateA, 100)}%` }} />
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Variant B (Risk-free Setup)</span>
                        <span className="text-white font-semibold font-mono">{t.sendsB} sends / {t.conversionRateB.toFixed(1)}% replies</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-violet-400 h-full rounded-full" style={{ width: `${Math.min(t.conversionRateB, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 6: SELF-IMPROVING AGENTS INTELLIGENCE CENTER */}
          {activeTab === 'intelligence' && (
            <div className="flex flex-col gap-6">

              {/* Header row */}
              <div className="glass-panel p-6 rounded-xl border border-rose-500/10">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                      <Zap size={18} className="text-rose-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Self-Improving Intelligence Layer</h2>
                      <p className="text-xs text-gray-400">Three autonomous agents that get smarter every cycle — refining leads, evolving copy, and weaponizing competitor weaknesses.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-1 rounded font-mono font-bold uppercase">ICP Optimizer Active</span>
                    <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-1 rounded font-mono font-bold uppercase">Scientist Active</span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-1 rounded font-mono font-bold uppercase">Intel Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-teal-400" />
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">ICP Optimizer</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Analyzes every CLOSED_WON deal to discover which store types and cities convert best — then rewrites the lead search strategy automatically each cycle.</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Runs every cycle</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
                    </div>
                  </div>
                  <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={14} className="text-violet-400" />
                      <span className="text-xs font-bold text-violet-300 uppercase tracking-wide">Campaign Scientist</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Monitors A/B email reply rates, statistically identifies the winning variant, kills the loser, and uses GPT-4o to generate a fresh challenger copy every cycle.</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Runs every cycle</span>
                      <span className="text-[10px] bg-violet-500/10 text-violet-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
                    </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={14} className="text-rose-400" />
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">Competitor Intel</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Scrapes competitor reviews (Fever-Tree, Stirrings, etc.) weekly to surface packaging failures, taste complaints, and margin weaknesses — injecting them directly into the Objection Agent.</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Runs weekly</span>
                      <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ICP Optimizer Profile */}
              <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-teal-400" />
                    <h3 className="text-sm font-bold text-white">ICP Optimizer — Current Search Strategy</h3>
                  </div>
                  {data.icpProfile && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">Confidence:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 bg-white/5 rounded-full h-1.5">
                          <div className="bg-teal-400 h-full rounded-full transition-all" style={{ width: `${data.icpProfile.confidenceScore}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-teal-300 font-bold">{data.icpProfile.confidenceScore}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {!data.icpProfile ? (
                  <div className="text-center p-8 border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                    ICP profile not yet generated. Run one GTM cycle to initialize the optimizer.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2">Priority Search Queries</p>
                      <div className="flex flex-col gap-1.5">
                        {data.icpProfile.prioritySearchQueries.slice(0, 6).map((q: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] bg-black/20 px-2 py-1.5 rounded">
                            <span className="text-teal-500 font-mono font-bold shrink-0">{i + 1}.</span>
                            <span className="text-gray-200">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Converting Cities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {data.icpProfile.topCities.map((city: string, i: number) => (
                            <span key={i} className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full font-medium">{city}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Agent Insight</p>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{data.icpProfile.insight}</p>
                        <div className="flex justify-between mt-3 text-[10px]">
                          <span className="text-gray-500">CLOSED_WON analyzed: <span className="text-white font-mono font-bold">{data.icpProfile.closedWonCount}</span></span>
                          <span className="text-gray-500">Avg deal: <span className="text-white font-mono font-bold">${data.icpProfile.avgClosedValue.toLocaleString()}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Scientist Reports */}
              <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-violet-400" />
                    <h3 className="text-sm font-bold text-white">Campaign Scientist — A/B Evolution Log</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{data.scientistReports?.length || 0} experiments run</span>
                </div>

                {!data.scientistReports || data.scientistReports.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                    No experiment reports yet. Run a GTM cycle to start evolving your email copy.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[...data.scientistReports].reverse().slice(0, 5).map((r: any) => (
                      <div key={r.id} className={`p-4 rounded-xl border text-[11px] ${
                        r.action === 'INSUFFICIENT_DATA'
                          ? 'bg-gray-500/5 border-gray-500/15'
                          : 'bg-violet-500/5 border-violet-500/15'
                      }`}>
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              r.action === 'INSUFFICIENT_DATA' ? 'bg-gray-500/20 text-gray-400' :
                              r.action === 'CHAMPION_CROWNED' ? 'bg-green-500/20 text-green-400' :
                              'bg-violet-500/20 text-violet-300'
                            }`}>{r.action.replace(/_/g, ' ')}</span>
                            <span className="text-gray-500 text-[10px]">{new Date(r.timestamp).toLocaleString()}</span>
                          </div>
                          {r.action !== 'INSUFFICIENT_DATA' && (
                            <div className="flex gap-3 text-[10px]">
                              <span className="text-teal-300">Winner: <strong>Variant {r.winnerVariant}</strong> ({(r.winnerConversionRate * 100).toFixed(1)}%)</span>
                              <span className="text-rose-300">Killed: <strong>Variant {r.killedVariant}</strong> ({(r.loserConversionRate * 100).toFixed(1)}%)</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-2">{r.insight}</p>
                        {r.newChallengerSubject && (
                          <div className="bg-black/30 p-2 rounded border border-white/5">
                            <span className="text-[9px] text-violet-400 font-bold uppercase">New Challenger Subject:</span>
                            <p className="text-[10px] text-white mt-0.5 font-medium">"{r.newChallengerSubject}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Competitor Intel Reports */}
              <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Competitor Intelligence — Weakness Catalog</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {(data.competitorIntelReports?.length || 0)} intel cycles completed
                  </span>
                </div>

                {(!data.competitorIntelReports || data.competitorIntelReports.length === 0) && (
                  <div className="text-center p-8 border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                    No competitor intel reports yet. Run a GTM cycle to scrape competitor weaknesses.
                  </div>
                )}

                {data.competitorIntelReports && data.competitorIntelReports.length > 0 && [data.competitorIntelReports[data.competitorIntelReports.length - 1]].map((latest: any) => (
                  <div key={latest.id} className="flex flex-col gap-4">
                    <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Latest Intelligence Report</span>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(latest.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{latest.insight}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {latest.competitorsAnalyzed.map((c: string) => (
                          <span key={c} className="text-[9px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {latest.weaknesses.slice(0, 6).map((w: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border text-[11px] ${
                          w.severity === 'HIGH' ? 'bg-red-500/5 border-red-500/15' :
                          w.severity === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/15' :
                          'bg-gray-500/5 border-gray-500/15'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-white">{w.competitor}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                              w.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                              w.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>{w.severity} — {w.weaknessType.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-gray-400 leading-relaxed">{w.discoveredText}</p>
                        </div>
                      ))}
                    </div>

                    {latest.injectedObjectionOverrides && latest.injectedObjectionOverrides.length > 0 && (
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Zap size={12} className="text-amber-400" />
                          Override Angles Injected into Objection Engine
                        </p>
                        <div className="flex flex-col gap-2">
                          {latest.injectedObjectionOverrides.map((o: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5">
                              <div className="shrink-0 bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase mt-0.5">TRIGGER: {o.objectionTrigger}</div>
                              <div className="text-gray-300 leading-relaxed">{o.overrideAngle}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Triage, Pricing & Nurture Engine Reports */}
              <div className="glass-panel p-6 rounded-xl border border-blue-500/10 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Full-Funnel Optimization Engine</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/2 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Inbox Triage Agent</p>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">Dynamically categorizes incoming replies and routes them to the correct agent pipeline (Referral, Objection, Ready).</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-blue-400 font-mono text-xl font-bold">Active</span>
                    </div>
                  </div>

                  <div className="bg-white/2 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Offer Fulfillment Agent</p>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">Guarantees the unbeatable $100 Off Airgoods promo is served to every buyer to lock in maximum deal conversion.</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-emerald-400 font-mono text-xl font-bold">Active</span>
                    </div>
                  </div>

                  <div className="bg-white/2 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Account Nurture Agent</p>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">Monitors CLOSED_WON accounts and automatically triggers Airgoods reorder check-ins after 30 days.</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-rose-400 font-mono text-xl font-bold">
                        {data.pipeline?.filter((c: any) => c.retentionStatus === 'REORDER_PENDING').length || 0}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">Pending Reorders</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
      </section>

      {/* COLLAPSIBLE SYSTEM INTEGRITY DIAGNOSTICS & SENTINEL SELF-HEALING */}
      <section className={`glass-panel rounded-xl border transition-all duration-300 overflow-hidden mb-6 ${
        showDevDiagnostics 
          ? 'border-violet-500/30 bg-violet-950/5 shadow-lg shadow-violet-500/5' 
          : 'border-white/5 bg-black/20 hover:border-white/10'
      }`}>
        {/* Accordion Trigger Header */}
        <button
          onClick={() => setShowDevDiagnostics(!showDevDiagnostics)}
          className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-all hover:bg-white/2 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <Settings className={`w-4 h-4 text-violet-400 transition-transform duration-500 ${showDevDiagnostics ? 'rotate-90' : ''}`} />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                System Integrity Diagnostics & AI Sentinel™ Self-Healing Console
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {showDevDiagnostics 
                  ? 'Active sandbox testing, schema verification, and self-healing telemetry' 
                  : 'Developer fault injection & demonstration console (Click to expand)'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
              showDevDiagnostics ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-gray-400'
            }`}>
              {showDevDiagnostics ? 'Expanded' : 'Collapsed'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              showDevDiagnostics ? 'rotate-180 text-violet-400' : ''
            }`} />
          </div>
        </button>

        {/* Collapsible Content */}
        {showDevDiagnostics && (
          <div className="px-6 pb-6 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Bug size={16} className="text-violet-400" />
              <h4 className="text-xs font-bold text-white uppercase">Fault Injection Controls</h4>
            </div>
            <p className="text-xs text-gray-400 mb-6 max-w-4xl leading-relaxed">
              To demonstrate the zero-human self-healing capabilities of the **System Sentinel Agent**, choose one of the simulated API failure states below. When injected, the pipeline will break, the Sentinel will diagnose the issue, compile a TypeScript patch, run it inside a sandbox, and deploy it to hot-restore normal pipeline health automatically.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleRunStep('SCHEMA')}
                className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/35 transition-all text-left flex flex-col gap-2 cursor-pointer group"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded uppercase font-bold">API Schema Drift</span>
                  <AlertTriangle size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs font-semibold text-white">Break Apollo Scraper Schema</p>
                <p className="text-[11px] text-gray-400 leading-relaxed font-normal">Simulates Apollo split arrays changing to nested dicts, crashing the Lead Data agent. Sentinel will patch split parser rules.</p>
              </button>

              <button
                onClick={() => handleRunStep('SMTP')}
                className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/35 transition-all text-left flex flex-col gap-2 cursor-pointer group"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded uppercase font-bold">SMTP Reputation Block</span>
                  <Zap size={14} className="text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs font-semibold text-white">Break Outbound Communication</p>
                <p className="text-[11px] text-gray-400 leading-relaxed font-normal">Simulates Twilio/SendGrid blockages, crashing the SDR sequence. Sentinel will deploy alternative routing rules.</p>
              </button>

              <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 flex flex-col justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  <p className="text-xs font-bold text-white">Live System Status Console</p>
                </div>
                <p className="text-[11px] text-teal-300 font-mono leading-relaxed bg-black/40 p-2 rounded border border-teal-500/10">
                  $ status: {statusMessage} <br />
                  $ cycles_completed: {cyclesRun} <br />
                  $ sandbox: STANDBY_OPTIMAL
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 border-t border-white/5 pt-6 mt-auto">
        Built with Cocktail Stix Orchestration Technology. Fully production-ready client deliverable GTM framework.
      </footer>
    </div>
  );
}

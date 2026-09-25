import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Layers, 
  KanbanSquare, 
  Clock, 
  Users, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle, 
  Download, 
  RefreshCw, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  FileCode,
  Sparkles
} from 'lucide-react';
import { InboxLogo } from '../components/common/InboxLogo';
import { SupportBadge } from '../components/common/SupportBadge';
import { SLABadge } from '../components/common/SLABadge';
import { useApp } from '../context/AppContext';

export const DocumentationPage: React.FC = () => {
  const { settings, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'sla' | 'lifecycle' | 'roles' | 'data' | 'faq'>('overview');

  // Interactive SLA Calculator demo state
  const [calcTier, setCalcTier] = useState<'L1' | 'L2' | 'L3'>('L1');
  const [calcPriority, setCalcPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');

  // Calculate simulated SLA hours based on current workspace settings
  const baseResponseHours = calcTier === 'L1' 
    ? (settings.slaSettings?.l1ResponseHours ?? 4) 
    : calcTier === 'L2' 
      ? (settings.slaSettings?.l2ResponseHours ?? 2) 
      : (settings.slaSettings?.l3ResponseHours ?? 1);

  const baseResolutionHours = calcTier === 'L1' 
    ? (settings.slaSettings?.l1ResolutionHours ?? 24) 
    : calcTier === 'L2' 
      ? (settings.slaSettings?.l2ResolutionHours ?? 12) 
      : (settings.slaSettings?.l3ResolutionHours ?? 6);

  // Priority multiplier
  const priorityMultiplier = calcPriority === 'Critical' ? 0.5 : calcPriority === 'High' ? 0.75 : calcPriority === 'Medium' ? 1 : 1.5;
  const effectiveResponseHours = Math.max(0.5, +(baseResponseHours * priorityMultiplier).toFixed(1));
  const effectiveResolutionHours = Math.max(1, +(baseResolutionHours * priorityMultiplier).toFixed(1));

  const tabs = [
    { id: 'overview', label: '1. What Inbox Does', icon: Sparkles },
    { id: 'sla', label: '2. Support Escalation (L1/L2/L3)', icon: ShieldAlert },
    { id: 'lifecycle', label: '3. Issue & Sprint Lifecycle', icon: KanbanSquare },
    { id: 'roles', label: '4. Roles & Personas', icon: Users },
    { id: 'data', label: '5. Configuration & Persistence', icon: Settings },
    { id: 'faq', label: '6. Common Questions & FAQ', icon: HelpCircle },
  ] as const;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <BookOpen size={13} />
              <span>Official System Documentation &amp; Architecture Manual</span>
            </div>
            
            <div className="pt-1">
              <InboxLogo size="lg" showSubtitle={true} />
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
              <strong>Inbox</strong> is a unified Gold_mine issue tracking, agile sprint management, and multi-tier 
              (L1/L2/L3) support escalation engine. It bridges customer operations, technical support, and core engineering 
              with automated SLA breach protection and live handoff audit trails.
            </p>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Support Tiers</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">L1, L2, L3</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active Escalation</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Appearance</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold capitalize text-zinc-900 dark:text-zinc-100">{theme} Mode</span>
                <button
                  onClick={toggleTheme}
                  className="text-[10px] underline text-blue-600 dark:text-blue-400 font-medium"
                >
                  Toggle
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Class-based dark mode</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Storage Engine</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Local State</p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Zero Setup Needed</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 mt-6 pt-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                What Does Inbox Actually Do?
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                A high-level architectural walkthrough of why Inbox Infotech exists and the problems it solves.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Customer Issue Triage</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Ingests inbound service requests, incidents, and bugs. Automatically indexes them with 
                  custom project keys (e.g. <code>INB-101</code>), priorities, and initial L1 assignment.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Agile Sprint &amp; Kanban Execution</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Engineering teams plan two-week sprints, prioritize backlogs, manage story points, 
                  and drag-and-drop tasks across Kanban stages (To Do, In Progress, Review, Done).
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Automated SLA Escalations</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Live countdown clocks monitor response and resolution targets. If L1 cannot resolve within SLA 
                  or encounters an unhandled bug, it escalates to L2 technical support or L3 core engineers.
                </p>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-3">
                Lifecycle Data Flow: From Customer Ticket to Engineering Resolution
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-blue-200/60 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">Step 1: Intake</span>
                  <p className="text-zinc-500 dark:text-zinc-400">Issue created with Priority &amp; Category. L1 response timer starts ticking immediately.</p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-blue-200/60 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">Step 2: L1 Triage</span>
                  <p className="text-zinc-500 dark:text-zinc-400">Support Agent acknowledges ticket. If configuration issue, resolved directly.</p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-blue-200/60 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">Step 3: Escalation (L2 / L3)</span>
                  <p className="text-zinc-500 dark:text-zinc-400">If bug or outage, ticket is escalated with reasoning. Assigned to specialized tier engineer.</p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-blue-200/60 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">Step 4: Hotfix &amp; Close</span>
                  <p className="text-zinc-500 dark:text-zinc-400">Engineering deploys patch, links to Sprint or Kanban card, and resolves SLA cycle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SLA Escalation Matrix */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" />
                The Three Support Tiers (L1, L2, L3) Explained
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                How tickets are distributed and escalated across tiers to meet Gold_mine SLAs.
              </p>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 font-bold">Support Tier</th>
                    <th className="p-3 font-bold">Designated Role</th>
                    <th className="p-3 font-bold">Standard Scope</th>
                    <th className="p-3 font-bold">Target Response SLA</th>
                    <th className="p-3 font-bold">Target Resolution SLA</th>
                    <th className="p-3 font-bold">Escalation Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3">
                      <SupportBadge level="L1" size="md" />
                    </td>
                    <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                      Support Agent / Helpdesk
                    </td>
                    <td className="p-3">
                      First-contact diagnosis, password resets, basic access rights, UI usability inquiries, bug intake.
                    </td>
                    <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {settings.slaSettings?.l1ResponseHours ?? 4} Hours
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {settings.slaSettings?.l1ResolutionHours ?? 24} Hours
                    </td>
                    <td className="p-3 text-zinc-500">
                      Issue requires database queries, config file modification, or reproducible software defect.
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3">
                      <SupportBadge level="L2" size="md" />
                    </td>
                    <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                      Technical Support Engineer
                    </td>
                    <td className="p-3">
                      Log inspection, API error diagnosis, database index repair, integrations &amp; webhook failures.
                    </td>
                    <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {settings.slaSettings?.l2ResponseHours ?? 2} Hours
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {settings.slaSettings?.l2ResolutionHours ?? 12} Hours
                    </td>
                    <td className="p-3 text-zinc-500">
                      Source code patch, architectural defect, infrastructure downtime, or data corruption.
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3">
                      <SupportBadge level="L3" size="md" />
                    </td>
                    <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                      Core Software / DevOps Engineer
                    </td>
                    <td className="p-3">
                      Direct codebase commits, schema migration, cloud container recovery, critical security hotfixes.
                    </td>
                    <td className="p-3 font-mono font-semibold text-red-600 dark:text-red-400">
                      {settings.slaSettings?.l3ResponseHours ?? 1} Hour
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {settings.slaSettings?.l3ResolutionHours ?? 6} Hours
                    </td>
                    <td className="p-3 text-zinc-500">
                      Highest tier; resolved via emergency hotfix or scheduled sprint release.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Live Interactive SLA Calculator */}
            <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Interactive SLA Target Simulator
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Test how tier level and issue priority adjust the automated SLA countdown.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Live Calculator
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Select Support Tier:
                  </label>
                  <div className="flex gap-2">
                    {(['L1', 'L2', 'L3'] as const).map(tier => (
                      <button
                        key={tier}
                        onClick={() => setCalcTier(tier)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                          calcTier === tier
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {tier} Tier
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Select Priority:
                  </label>
                  <div className="flex gap-1.5">
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map(pri => (
                      <button
                        key={pri}
                        onClick={() => setCalcPriority(pri)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                          calcPriority === pri
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Response Target</span>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {effectiveResponseHours} Hours
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Resolution Target</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {effectiveResolutionHours} Hours
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Warning Threshold</span>
                  <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {settings.slaSettings?.warningThresholdHours ?? 2} Hours Left
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Lifecycle & Kanban */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <KanbanSquare size={18} className="text-blue-600" />
                Issue Status Lifecycle &amp; Sprint Management
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                How issues transition across states from backlog to completion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 mb-2">
                  To Do
                </span>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Queued for Work</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Ticket accepted into current sprint or active support queue. Waiting for an engineer to begin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mb-2">
                  In Progress
                </span>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Active Investigation</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Technician is debugging code, reproducing issue, or developing fix. Response SLA timer stops.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 mb-2">
                  Under Review
                </span>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">QA / Peer Review</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Code review, pull request testing, or user confirmation of resolution.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 mb-2">
                  Resolved
                </span>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Fixed &amp; Verified</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Fix released to production. Resolution SLA timer records total elapsed time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 mb-2">
                  Closed
                </span>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Archived</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Final state. Retained in historical audits and reports.
                </p>
              </div>
            </div>

            {/* Backlog & Sprint Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                Sprint Planning &amp; Story Estimation
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                In the <strong>Backlog</strong> view, product leads can organize upcoming work into distinct 2-week iterations:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li><strong>Active Sprint</strong>: Work in progress right now. Issues appear on the Kanban Board.</li>
                <li><strong>Planned / Future Sprints</strong>: Staged issues with estimated story points for upcoming development cycles.</li>
                <li><strong>Epics &amp; Components</strong>: Thematic umbrellas (e.g. <em>Auth System</em>, <em>Billing Engine</em>) grouping related tickets.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Roles & Personas */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Team Roles &amp; Tier Assignment
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                How user permissions and support tiers are simulated across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Administrator</span>
                  <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold px-1.5 py-0.2 rounded">
                    Full Access
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Can modify SLA thresholds, manage workspace settings, create/delete projects, and simulate any user.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Support Agent</span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold px-1.5 py-0.2 rounded">
                    L1 Queue
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Primary operator for frontline customer intake. Handles initial response, triage, and handoff escalations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Technical Lead</span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded">
                    L2 Support
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Deep technical troubleshooting, configuration validation, reproducible defect analysis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Core Engineer</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                    L3 &amp; DevOps
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Direct code authoring, hotfixes, database repair, deployment pipelines, sprint task resolution.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                💡 Tip: Try the Instant User Switcher
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Click on the user avatar in the top right corner of the screen at any time to switch personas 
                (e.g., test acting as an L1 Support Agent vs. an L3 DevOps Engineer). The UI will instantly reflect 
                your assigned tickets and tier capabilities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Configuration & Persistence */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                Data Portability &amp; Workspace Persistence
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Everything stays saved on your browser, with complete JSON backup export and import.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Download size={16} className="text-emerald-600" />
                  Full Workspace Backup
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  You can export the entire workspace (all issues, projects, epics, comments, sprints, audit trails, and custom SLA rules) 
                  into a single clean JSON file. Keep it as a backup or share it with your team.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <RefreshCw size={16} className="text-blue-600" />
                  One-Click Reset &amp; Seeding
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Need a clean demo state? The Settings page allows administrators to instantly reset the system 
                  to high-fidelity initial seed data populated with realistic tickets across all support levels.
                </p>
              </div>

              {/* Password Auth & Admin Governance */}
              <div className="p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-3 md:col-span-2">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Password Authentication &amp; Admin Panel Governance
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  The application is configured to <strong>default at landing to the Login Page</strong> (<code>/login</code>). 
                  Access to the ticketing workspace, backlog, and queues requires authenticating with a valid member password. 
                  Administrators can navigate to the <strong>Admin Panel</strong> (<code>/admin</code>) to manage user accounts, 
                  inspect and reset member passwords, update SLA matrices, and download full database JSON backups.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Admin: tejas@inbox.Gold_mine.io (admin123)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Support L1: rahul.s@inbox.Gold_mine.io (support123)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Tech L2: priya.p@inbox.Gold_mine.io (tech123)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    Engineer L3: amit.shah@inbox.Gold_mine.io (engineer123)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-600" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  How does the SLA countdown work?
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Each issue tracks its creation timestamp against the SLA hours configured for its support tier and priority. 
                  If more than 75% of the allowable time has elapsed (or within the configured warning threshold), 
                  the badge turns amber (<em>At Risk</em>). If the limit is exceeded, it turns red (<em>Breached</em>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  How do I switch between Light and Dark mode?
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Click the Sun/Moon icon in the top navigation bar, or go to <strong>Settings</strong> to pick Light, Dark, or System mode. 
                  The styling uses Tailwind CSS v4 class-based variants, transforming backgrounds, text contrast, borders, and modal dialogs instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  Can I customize the SLA hours?
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes! Head to <strong>Settings &amp; SLA Rules</strong> in the sidebar. You can configure the response and resolution hours 
                  for L1, L2, and L3 tiers individually, as well as the early warning threshold.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  Where is my data stored?
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  All projects, tickets, comments, and sprints are securely stored in your browser's local storage. 
                  No external servers or cloud accounts are required. You can export a JSON backup at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

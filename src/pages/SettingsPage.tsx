import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sliders, 
  Clock, 
  ShieldAlert, 
  RotateCcw, 
  Download, 
  Upload, 
  Bell, 
  Moon, 
  Sun, 
  Check, 
  Save, 
  Database,
  Building,
  AlertOctagon
} from 'lucide-react';
import { exportAllDataAsJSON, importDataFromJSON, resetAllDataToSeed } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { InboxLogo } from '../components/common/InboxLogo';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, theme, setTheme, addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SLA Form state
  const [l1Response, setL1Response] = useState(settings.slaSettings?.l1ResponseHours ?? 4);
  const [l1Resolution, setL1Resolution] = useState(settings.slaSettings?.l1ResolutionHours ?? 24);
  const [l2Response, setL2Response] = useState(settings.slaSettings?.l2ResponseHours ?? 2);
  const [l2Resolution, setL2Resolution] = useState(settings.slaSettings?.l2ResolutionHours ?? 12);
  const [l3Response, setL3Response] = useState(settings.slaSettings?.l3ResponseHours ?? 1);
  const [l3Resolution, setL3Resolution] = useState(settings.slaSettings?.l3ResolutionHours ?? 6);
  const [warningThreshold, setWarningThreshold] = useState(settings.slaSettings?.warningThresholdHours ?? 2);

  // General Form state
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName ?? 'Acme Global Workspace');
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled ?? true);

  // Confirm Reset Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workspaceName,
      notificationsEnabled,
      slaSettings: {
        l1ResponseHours: Number(l1Response),
        l1ResolutionHours: Number(l1Resolution),
        l2ResponseHours: Number(l2Response),
        l2ResolutionHours: Number(l2Resolution),
        l3ResponseHours: Number(l3Response),
        l3ResolutionHours: Number(l3Resolution),
        warningThresholdHours: Number(warningThreshold),
      },
    });
    addToast('Settings Saved', 'Workspace configuration and SLA policies updated.', 'success');
  };

  const handleExportJSON = () => {
    const json = exportAllDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inbox-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup Exported', 'Workspace JSON backup saved.', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        window.location.reload();
      } else {
        addToast('Import Failed', 'Invalid JSON backup format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    resetAllDataToSeed();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          System &amp; SLA Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure response and resolution thresholds, theme mode, and manage local storage snapshots.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Workspace Identity */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-blue-500" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Workspace &amp; Organization Branding
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold">
              Inbox Infotech Pvt. Ltd.
            </span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <InboxLogo size="lg" />
            </div>
            <div className="text-left sm:text-right text-[11px] text-zinc-500 dark:text-zinc-400">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">Official Brand Identity</p>
              <p>Active vector logo for headers, sidebars &amp; documentation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Appearance Mode
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Enable live SLA notifications and escalation toast alerts
              </span>
            </label>
          </div>
        </div>

        {/* SLA Rule Matrix */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Support Level SLA Policies
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">Hours from ticket creation</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* L1 Policies */}
            <div className="p-4 rounded-lg bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sky-900 dark:text-sky-200">L1 Frontline Support</span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400">Basic triage &amp; user support</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Response (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l1Response}
                    onChange={e => setL1Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Resolution (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l1Resolution}
                    onChange={e => setL1Resolution(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* L2 Policies */}
            <div className="p-4 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-900 dark:text-amber-200">L2 Technical Support</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Advanced troubleshooting</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Response (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l2Response}
                    onChange={e => setL2Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Resolution (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l2Resolution}
                    onChange={e => setL2Resolution(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* L3 Policies */}
            <div className="p-4 rounded-lg bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-900 dark:text-purple-200">L3 Engineering Support</span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400">Deep bug fixing &amp; code change</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Response (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l3Response}
                    onChange={e => setL3Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Target Resolution (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={l3Resolution}
                    onChange={e => setL3Resolution(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Warning threshold */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                &ldquo;At Risk&rdquo; SLA Warning Threshold (Hours before breach)
              </label>
              <input
                type="number"
                min="1"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full sm:w-48 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Tickets transition from &ldquo;Within SLA&rdquo; to amber &ldquo;At Risk&rdquo; status when remaining time falls below this threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save size={14} />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>

      {/* LocalStorage Data Management Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <Database size={16} className="text-zinc-500" />
          <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Browser Persistence &amp; Local Backup
          </h2>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Inbox stores all tickets, escalation history, internal notes, users, and sprint data directly in your browser&apos;s <code className="text-blue-600">localStorage</code>. Export your data to carry states between sessions or restore sample seed data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs transition"
          >
            <Download size={14} />
            <span>Export Backup JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs transition"
          >
            <Upload size={14} />
            <span>Import Backup JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportJSON}
          />

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs transition ml-auto"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Workspace Data?"
        message="This will overwrite all tickets, comments, and project changes with the initial demonstration seed data. Do you want to continue?"
        confirmLabel="Reset to Seed"
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  RotateCcw, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Save, 
  Database,
  Building,
  Globe
} from 'lucide-react';
import { exportAllDataAsJSON, importDataFromJSON, resetAllDataToSeed } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { InboxLogo } from '../components/common/InboxLogo';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, theme, setTheme, addToast, t } = useApp();
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
    addToast(t('toasts.settingsSaved'), t('toasts.settingsSavedDesc'), 'success');
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
    addToast(t('toasts.settingsSaved'), t('settings.exportBackup'), 'success');
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
        addToast(t('common.error'), 'Invalid JSON format', 'error');
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
          {t('settings.title')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Language Selection Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {t('settings.languageSection')}
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold">
              {t('settings.threeLanguagesOnly')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {t('settings.languageLabel')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t('settings.languageDesc')}
              </p>
            </div>
            <LanguageSwitcher variant="segmented" />
          </div>
        </div>

        {/* Workspace Identity */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-blue-500" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {t('settings.generalSection')}
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
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">Inbox GoldMine</p>
              <p>{t('nav.brandTagline')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('settings.workspaceName')}
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('settings.appearanceSection')}
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
                  <span>{t('settings.themeLight')}</span>
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
                  <span>{t('settings.themeDark')}</span>
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
                {t('settings.enableNotifications')}
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
                {t('settings.slaPoliciesSection')}
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* L1 Policies */}
            <div className="p-4 rounded-lg bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sky-900 dark:text-sky-200">{t('support.l1Full')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l1ResponseHours')}</label>
                  <input
                    type="number"
                    min="1"
                    value={l1Response}
                    onChange={e => setL1Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l1ResolutionHours')}</label>
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
                <span className="font-bold text-amber-900 dark:text-amber-200">{t('support.l2Full')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l2ResponseHours')}</label>
                  <input
                    type="number"
                    min="1"
                    value={l2Response}
                    onChange={e => setL2Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l2ResolutionHours')}</label>
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
                <span className="font-bold text-purple-900 dark:text-purple-200">{t('support.l3Full')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l3ResponseHours')}</label>
                  <input
                    type="number"
                    min="1"
                    value={l3Response}
                    onChange={e => setL3Response(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t('settings.l3ResolutionHours')}</label>
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
                {t('settings.warningThreshold')}
              </label>
              <input
                type="number"
                min="1"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full sm:w-48 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 font-mono"
              />
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
            <span>{t('settings.saveBtn')}</span>
          </button>
        </div>
      </form>

      {/* LocalStorage Data Management Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <Database size={16} className="text-zinc-500" />
          <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {t('settings.dataManagementSection')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs transition"
          >
            <Download size={14} />
            <span>{t('settings.exportBackup')}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs transition"
          >
            <Upload size={14} />
            <span>{t('settings.importBackup')}</span>
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
            <span>{t('settings.resetSeed')}</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title={t('settings.resetConfirmTitle')}
        message={t('settings.resetConfirmDesc')}
        confirmLabel={t('settings.resetSeed')}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

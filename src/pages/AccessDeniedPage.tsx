import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  AppPageId, 
  getPageDefinition, 
  getAllowedRolesForPage, 
  getAllowedPagesForRole 
} from '../services/rbac';
import { 
  ShieldAlert, 
  ArrowLeft, 
  UserCheck, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AccessDeniedPageProps {
  pageId: AppPageId;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ pageId }) => {
  const navigate = useNavigate();
  const { currentUser, settings } = useApp();

  const pageDef = getPageDefinition(pageId);
  const pageTitle = pageDef?.label || 'Restricted Page';
  const pageCategory = pageDef?.category || 'Workspace';
  
  const allowedRoles = getAllowedRolesForPage(pageId, settings.rolePageAccess);
  const userAllowedPages = getAllowedPagesForRole(currentUser.role, settings.rolePageAccess);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/20 p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
              <Lock size={24} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                  Access Restricted
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {pageCategory} Module
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Permission Denied for {pageTitle}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your role does not have authorization to view or manage this section.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* User & Role Diagnostic Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={13} className="text-blue-500" />
                Current Active Session
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
                {currentUser.email}
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Role: {currentUser.role}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-amber-500" />
                Authorized Roles for {pageTitle}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allowedRoles.length > 0 ? (
                  allowedRoles.map((role) => (
                    <span 
                      key={role}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400">Strictly Restricted</span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-2">
                Governed by workspace Role-Based Access Policies.
              </div>
            </div>
          </div>

          {/* Suggested Permitted Pages */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Available Pages for Your Role ({currentUser.role})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {userAllowedPages.slice(0, 6).map((pid) => {
                const def = getPageDefinition(pid);
                if (!def) return null;
                return (
                  <button
                    key={pid}
                    onClick={() => navigate(def.path)}
                    className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 hover:bg-white dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-left transition flex items-center justify-between group shadow-sm hover:border-blue-500/50"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {def.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {def.path}
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-zinc-400 group-hover:text-blue-500 transition shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <ArrowLeft size={14} />
              Return to Dashboard
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/docs')}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500" />
                View Access Guidelines
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink size={13} />
                Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

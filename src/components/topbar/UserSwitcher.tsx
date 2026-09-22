import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings as SettingsIcon, RotateCcw, Shield, LogOut } from 'lucide-react';
import { SupportBadge } from '../common/SupportBadge';

export const UserSwitcher: React.FC = () => {
  const { users, currentUser, switchUser, resetAllData, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
        title="Switch active user / view profile"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100"
          referrerPolicy="no-referrer"
        />
        <div className="hidden md:block">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentUser.role}
          </div>
        </div>
        <ChevronDown size={14} className="text-zinc-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Active User Header */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {currentUser.supportLevels.map(lvl => (
                    <SupportBadge key={lvl} level={lvl} size="sm" showLabel={false} />
                  ))}
                  <span className="text-[10px] text-zinc-400 font-mono px-1 bg-zinc-200 dark:bg-zinc-800 rounded">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Switch Demo Role Section */}
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Switch Active User (Demo)
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition flex items-center justify-between ${
                    u.id === currentUser.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate">{u.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-400 font-mono">{u.supportLevels.join('/')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <User size={14} className="text-zinc-400" />
              <span>My Profile &amp; Stats</span>
            </button>
            <button
              onClick={() => {
                navigate('/admin');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 font-medium"
            >
              <Shield size={14} className="text-blue-500" />
              <span>Admin Panel &amp; Governance</span>
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <SettingsIcon size={14} className="text-zinc-400" />
              <span>System Settings &amp; SLA Rules</span>
            </button>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
                navigate('/login');
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
            >
              <LogOut size={14} className="text-amber-500" />
              <span>Sign Out Session</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all issues, sprints, and team members to factory seed state?')) {
                  resetAllData();
                  setIsOpen(false);
                }
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
            >
              <RotateCcw size={14} className="text-rose-500" />
              <span>Reset Data to Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

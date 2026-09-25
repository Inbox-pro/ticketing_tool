import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InboxLogo } from '../components/common/InboxLogo';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  Sun, 
  Moon,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, login, isAuthenticated, currentUser, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected account or custom email
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'user-1');
  const [emailInput, setEmailInput] = useState<string>(users[0]?.email || 'tejas@inbox.Gold_mine.io');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // When changing selected user dropdown
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const found = users.find(u => u.id === userId);
    if (found) {
      setEmailInput(found.email);
      setPassword(found.password || 'password123');
      setErrorMessage('');
    }
  };

  // Quick fill preset credentials
  const handleQuickFill = (userEmail: string) => {
    const found = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (found) {
      setSelectedUserId(found.id);
      setEmailInput(found.email);
      setPassword(found.password || 'password123');
      setErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailInput.trim()) {
      setErrorMessage('Please enter your email or select a member account.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password to proceed.');
      return;
    }

    setIsSubmitting(true);
    // Attempt login with email/id and password
    const result = login(emailInput.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your password.');
    }
  };

  const selectedUserObj = users.find(u => u.id === selectedUserId || u.email.toLowerCase() === emailInput.toLowerCase());

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top bar with quick theme toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Gold_mine Portal
          </span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Brand Header */}
          <div className="p-6 sm:p-8 text-center border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-850/40">
            <div className="inline-flex justify-center mb-4">
              <InboxLogo size="lg" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Gold_mine Sign In
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              Authenticate with your staff credentials to access issues, SLA queues &amp; sprint boards.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Quick 1-Click Role Switchers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-zinc-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('tejas@inbox.Gold_mine.io')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-blue-500 text-left transition"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    AD
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">Tejas (Admin)</p>
                    <p className="text-[9px] text-zinc-400 font-mono">admin123</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('rahul.s@inbox.Gold_mine.io')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-blue-500 text-left transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    L1
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">Rahul (Support L1)</p>
                    <p className="text-[9px] text-zinc-400 font-mono">support123</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('priya.p@inbox.Gold_mine.io')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-blue-500 text-left transition"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold">
                    L2
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">Priya (Tech L2)</p>
                    <p className="text-[9px] text-zinc-400 font-mono">tech123</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('amit.shah@inbox.Gold_mine.io')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-blue-500 text-left transition"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center text-[10px] font-bold">
                    L3
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">Amit (DevOps L3)</p>
                    <p className="text-[9px] text-zinc-400 font-mono">engineer123</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Selector Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Select User Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => handleUserSelect(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => {
                      setEmailInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="name@inbox.Gold_mine.io"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Account Password
                  </label>
                  {selectedUserObj?.password && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      Hint: {selectedUserObj.password}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter account password"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Sign In to Workspace'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Footer status notice */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-850/60 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Protected Session &bull; Local Storage Offline Authentication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-5xl mx-auto text-center py-2 text-[11px] text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} Inbox Infotech Pvt. Ltd. Ticketing &amp; Issue Tracking System.
      </div>
    </div>
  );
};

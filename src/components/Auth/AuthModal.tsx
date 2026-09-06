import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Key,
  LogOut,
  RefreshCw,
  Sparkles,
  Smartphone,
  Laptop,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getFirebaseConfig,
  saveCustomFirebaseConfig,
  isFirebaseConfigured,
  initFirebase
} from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, syncStatus, isSyncing, forceSyncCloud } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Config fields
  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [appId, setAppId] = useState(currentConfig.appId);
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!isFirebaseConfigured()) {
      setMode('config');
      setErrorMsg('Please save your Firebase API keys first to enable cloud authentication.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        setSuccessMsg('Successfully signed in! Your data is syncing across your devices.');
      } else {
        await signUpWithEmail(email, password);
        setSuccessMsg('Account created successfully! Your current recipes and meals are now synced to your cloud account.');
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('API Key and Project ID are required.');
      return;
    }

    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: `${projectId.trim()}.firebasestorage.app`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });

    initFirebase();
    setSuccessMsg('Firebase credentials saved successfully! You can now sign in.');
    setMode('signin');
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setSuccessMsg('Signed out. Local offline mode is now active.');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                Cross-Device Sync
              </div>
              <h2 className="text-xl font-black">
                {currentUser ? 'Cloud Sync Active' : 'Sync Phone & Website'}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* If Logged In */}
          {currentUser ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Connected Account
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="font-black text-slate-900 text-base break-all">
                  {currentUser.email}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Everything you plan, cook, or log on your phone automatically syncs to your desktop in real-time.
                </p>
              </div>

              {/* Multi-Device visual callout */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div className="flex flex-col items-center gap-1 py-1">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">iPhone / Android</span>
                  <span className="text-[10px] text-slate-400">Mobile PWA</span>
                </div>
                <div className="flex flex-col items-center gap-1 py-1">
                  <Laptop className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">Computer</span>
                  <span className="text-[10px] text-slate-400">Web Browser</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={forceSyncCloud}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Auth Forms */
            <div>
              {/* Tab Switcher */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode('config')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    mode === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Configure Firebase Keys"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keys</span>
                </button>
              </div>

              {mode === 'config' ? (
                /* Config Form */
                <form onSubmit={handleSaveConfig} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Firebase API Key (apiKey)
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      placeholder="mealcraft-app-b3ec5"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      App ID (appId)
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={e => setAppId(e.target.value)}
                      placeholder="1:1234567890:web:abcdef..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Save & Connect Firebase
                    </button>
                  </div>
                </form>
              ) : (
                /* Sign In / Sign Up Form */
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4" />
                    )}
                    <span>{mode === 'signin' ? 'Sign In & Sync' : 'Create Free Account & Sync'}</span>
                  </button>

                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                    By signing in on your phone and computer, your meals, grocery checklists, and health records stay 100% synchronized in real-time.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { auth, getFirebaseConfig, isConfigured } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Mail, Lock, Settings, Cloud, Database } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User | { email: string; isLocal: boolean } | null) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfigSettings, setShowConfigSettings] = useState(false);
  
  // Custom Firebase Config form
  const [cfg, setCfg] = useState(getFirebaseConfig());

  const handleFirebaseConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("FIREBASE_API_KEY", cfg.apiKey);
    localStorage.setItem("FIREBASE_AUTH_DOMAIN", cfg.authDomain);
    localStorage.setItem("FIREBASE_PROJECT_ID", cfg.projectId);
    localStorage.setItem("FIREBASE_STORAGE_BUCKET", cfg.storageBucket);
    localStorage.setItem("FIREBASE_MESSAGING_SENDER_ID", cfg.messagingSenderId);
    localStorage.setItem("FIREBASE_APP_ID", cfg.appId);
    window.location.reload(); // Reload to initialize Firebase with new config
  };

  const handleClearConfig = () => {
    localStorage.removeItem("FIREBASE_API_KEY");
    localStorage.removeItem("FIREBASE_AUTH_DOMAIN");
    localStorage.removeItem("FIREBASE_PROJECT_ID");
    localStorage.removeItem("FIREBASE_STORAGE_BUCKET");
    localStorage.removeItem("FIREBASE_MESSAGING_SENDER_ID");
    localStorage.removeItem("FIREBASE_APP_ID");
    window.location.reload();
  };

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          onAuthSuccess(firebaseUser);
        } else {
          onAuthSuccess(null);
        }
      });
      return unsubscribe;
    } else {
      // Check local session
      const localUser = localStorage.getItem("LOCAL_USER");
      if (localUser) {
        onAuthSuccess({ email: localUser, isLocal: true });
      }
    }
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isConfigured && auth) {
      try {
        if (isRegister) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      }
    } else {
      // Local Mock Auth Mode
      if (password.length < 6) {
        setError('Password must be at least 6 characters (Local Mode requirement)');
      } else {
        localStorage.setItem("LOCAL_USER", email);
        onAuthSuccess({ email, isLocal: true });
      }
    }
    setLoading(false);
  };

  const handleLocalGuestMode = () => {
    localStorage.setItem("LOCAL_USER", "guest@local.sandbox");
    onAuthSuccess({ email: "guest@local.sandbox", isLocal: true });
  };

  return (
    <div className="min-h-screen bg-editor flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-sidebar border border-border-color rounded-xl shadow-2xl overflow-hidden p-8">
        
        {/* Title / Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-card border border-border-color rounded-lg text-brand-accent mb-3">
            {isConfigured ? <Cloud className="w-8 h-8" /> : <Database className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-text-main">CV & Cover Letter Suite</h1>
          <p className="text-sm text-text-muted mt-1">
            {isConfigured 
              ? "Firebase-backed professional workspace" 
              : "Running in offline Local Sandbox Mode"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input-bg border border-border-color rounded-lg pl-10 pr-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input-bg border border-border-color rounded-lg pl-10 pr-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-accent text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded-lg shadow-lg hover:shadow-brand-accent/20 transition duration-200 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-text-muted">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-brand-accent transition cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          
          {!isConfigured && (
            <button
              onClick={handleLocalGuestMode}
              className="text-brand-accent font-semibold hover:underline cursor-pointer"
            >
              Enter as Guest &rarr;
            </button>
          )}
        </div>

        {/* Setting details for custom config */}
        <div className="border-t border-border-color/50 mt-8 pt-4">
          <button
            onClick={() => setShowConfigSettings(!showConfigSettings)}
            className="flex items-center justify-center gap-2 mx-auto text-xs text-text-muted hover:text-brand-accent transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            {showConfigSettings ? "Hide Firebase configuration Settings" : "Configure Custom Firebase Project"}
          </button>

          {showConfigSettings && (
            <form onSubmit={handleFirebaseConfigSave} className="mt-4 space-y-3 bg-card/50 p-4 border border-border-color rounded-lg">
              <p className="text-[11px] text-text-muted leading-relaxed">
                Connect this interface to your own free Firebase Spark tier. Keep fields empty to run locally.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">API Key</label>
                  <input
                    type="text"
                    value={cfg.apiKey}
                    onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
                    className="w-full bg-input-bg border border-border-color rounded p-1.5 text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={cfg.authDomain}
                    onChange={(e) => setCfg({ ...cfg, authDomain: e.target.value })}
                    className="w-full bg-input-bg border border-border-color rounded p-1.5 text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Project ID</label>
                  <input
                    type="text"
                    value={cfg.projectId}
                    onChange={(e) => setCfg({ ...cfg, projectId: e.target.value })}
                    className="w-full bg-input-bg border border-border-color rounded p-1.5 text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">App ID</label>
                  <input
                    type="text"
                    value={cfg.appId}
                    onChange={(e) => setCfg({ ...cfg, appId: e.target.value })}
                    className="w-full bg-input-bg border border-border-color rounded p-1.5 text-text-main"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded text-xs transition cursor-pointer"
                >
                  Save & Connect
                </button>
                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClearConfig}
                    className="py-1.5 px-3 bg-red-950 text-red-300 hover:bg-red-900 border border-red-500/30 rounded text-xs transition cursor-pointer"
                  >
                    Clear Credentials
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

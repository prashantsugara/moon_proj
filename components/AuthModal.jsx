import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const { signInWithEmail, signUpWithEmail, signInWithMagicLink } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'magiclink'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } else if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, fullName.trim());
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Error signing up.');
      } else {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } else if (mode === 'magiclink') {
      const { error } = await signInWithMagicLink(email);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Could not send magic link.');
      } else {
        setSuccessMsg('Check your email inbox for the magic login link!');
      }
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="brand-badge">
            <Sparkles size={18} color="var(--accent)" />
            <span>Luna Passport</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('signup')}
          >
            Create Account
          </button>
          <button
            className={`tab-btn ${mode === 'magiclink' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('magiclink')}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && (
            <div className="alert-box error">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box success">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Commander Neil Armstrong"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mode !== 'magiclink' && (
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? 'Sign In to Lunar Registry'
                    : mode === 'signup'
                    ? 'Create Passport Account'
                    : 'Send Magic Link'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-note">
          <Key size={13} color="var(--text-muted)" />
          <span>Secured with 256-bit Supabase Auth Protocol</span>
        </div>
      </div>

      <style>{`
        .auth-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(4, 7, 14, 0.82);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .auth-modal-card {
          width: 420px;
          max-width: 100%;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 8px 4px;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
          font-weight: 600;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .alert-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 12px;
        }

        .alert-box.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .alert-box.success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          padding: 10px 12px 10px 38px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .input-wrapper input:focus {
          border-color: var(--accent);
        }

        .auth-submit-btn {
          margin-top: 6px;
          padding: 12px;
          justify-content: center;
          gap: 8px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }

        .auth-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 14px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

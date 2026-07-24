import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill all fields', 'warning');
      return;
    }
    if (isSignUp && !name) {
      addToast('Name is required for signing up', 'warning');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isSignUp) {
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.ok) {
        addToast(isSignUp ? 'Registered successfully! Welcome 🎉' : 'Logged in successfully! Welcome back 👋', 'success');
        navigate('/');
      } else {
        addToast(res.data.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      addToast('Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-top-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>

      <div className="login-hero-header">
        <div className="logo-wrap">
          <img src="/icon-96x96.png" alt="SpendWise" width={48} height={48} style={{ borderRadius: 12 }} />
        </div>
        <h1 className="login-app-title">SpendWise</h1>
        <p className="login-app-subtitle">Smart finance tracker for smart people</p>
      </div>

      <div className="login-card-container">
        <div className="login-tabs">
          <button
            className={`login-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form-body">
          {isSignUp && (
            <div className="login-input-group">
              <span className="input-icon-left"><User size={18} /></span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="login-input-group">
            <span className="input-icon-left"><Mail size={18} /></span>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="login-input-group">
            <span className="input-icon-left"><Lock size={18} /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

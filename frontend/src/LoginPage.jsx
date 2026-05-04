import React, { useState } from 'react';

function LoginPage({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const API = 'http://127.0.0.1:5000/api';

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name || !email || !password) { setError('All fields are required'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Registration failed'); return; }
            setSuccess('Account created! Signing you in...');
            setTimeout(() => onLogin(data), 800);
        } catch { setError('Connection error. Is the server running?'); }
        finally { setLoading(false); }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!email || !password) { setError('Email and password are required'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Login failed'); return; }
            onLogin(data);
        } catch { setError('Connection error. Is the server running?'); }
        finally { setLoading(false); }
    };

    const switchMode = () => {
        setIsSignUp(!isSignUp);
        setError(''); setSuccess('');
        setName(''); setEmail(''); setPassword('');
    };

    return (
        <div className="login-page">
            <div className={`login-container ${isSignUp ? 'active' : ''}`}>
                {/* Sign Up Form */}
                <div className="form-container sign-up">
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account</h1>
                        <span style={{ marginTop: '12px' }}>Use your email to get started</span>
                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
                        {error && <div className="login-error">{error}</div>}
                        {success && <div className="login-success">{success}</div>}
                        <button type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Sign Up'}</button>
                    </form>
                </div>

                {/* Sign In Form */}
                <div className="form-container sign-in">
                    <form onSubmit={handleSignIn}>
                        <h1>Sign In</h1>
                        <span style={{ marginTop: '12px' }}>Use your email and password</span>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        {error && <div className="login-error">{error}</div>}
                        {success && <div className="login-success">{success}</div>}
                        <button type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Sign In'}</button>
                    </form>
                </div>

                {/* Toggle Panels */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Sign in with your account to access your financial dashboard</p>
                            <button className="hidden" type="button" onClick={switchMode}>Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Create an account to start tracking your expenses smartly</p>
                            <button className="hidden" type="button" onClick={switchMode}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

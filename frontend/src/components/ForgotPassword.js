import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const emailRegex = /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)$/;
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/forgot-password', { email }, { timeout: 15000 });
            if (res.data && res.data.success) {
                setMessage('If the email exists, an OTP has been sent.');
                // proceed to reset page with email prefilled
                setTimeout(() => navigate('/reset-password', { state: { email } }), 800);
            } else {
                setMessage('If the email exists, an OTP has been sent.');
            }
        } catch (err) {
            setMessage('If the email exists, an OTP has been sent.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-dismiss messages
    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(t);
        }
    }, [message]);
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(t);
        }
    }, [error]);

    return (
        <div className="auth-container" style={{ '--auth-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive an OTP code</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message general-error">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            autoComplete="email"
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;



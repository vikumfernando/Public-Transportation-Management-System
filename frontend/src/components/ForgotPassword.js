import React, { useState } from 'react';
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
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8070/auth/forgot-password', { email });
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

    return (
        <div className="auth-container">
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



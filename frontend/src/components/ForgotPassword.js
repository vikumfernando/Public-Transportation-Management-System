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
    const [current, setCurrent] = useState(0);

    const slides = [
        { id: 1, image: '/images/slide1.jpg', title: 'Reset Your Password', subTitle: 'Secure password recovery in just a few steps.' },
        { id: 2, image: '/images/slide2.jpg', title: 'Quick Recovery', subTitle: 'Get back to your account safely and easily.' },
        { id: 3, image: '/images/slide3.jpg', title: 'Account Security', subTitle: 'Your security is our top priority.' }
    ];

    // Auto-slide background images
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

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
            const res = await axios.post('http://localhost:8070/auth/forgot-password', { email }, { timeout: 15000 });
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
        <div
            className="auth-bg-gradient"
            style={{
                height: '100vh',
                minHeight: '100vh',
                padding: 0,
                margin: 0,
                backgroundImage: `linear-gradient(to bottom, rgba(240,235,232,0.8), rgba(255,255,255,0.9)), url(${slides[current].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    background: 'rgba(255,255,255,0.65)',
                    borderRadius: 24,
                    boxShadow: '0 24px 60px rgba(11,86,72,0.18)',
                    border: '1px solid rgba(255,255,255,0.45)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    padding: '48px 40px',
                    width: '100%',
                    maxWidth: 900,
                    margin: '0 20px',
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px'
                }}
            >
                {/* Left Panel - Form */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-center mb-4 animate-fade-in">
                        <img src="/images/siteLogo.png" alt="Logo" style={{ height: 60, marginBottom: 16 }} />
                        <h2 style={{ color: '#0B5648', fontSize: '28px', fontWeight: '700', marginBottom: 8 }}>Forgot Password?</h2>
                        <p style={{ color: '#718096', fontSize: '16px', marginBottom: 0 }}>Enter your email to receive an OTP code</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>{error}</div>}
                        {message && <div className="alert alert-success mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>{message}</div>}
                        
                        <div className="mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <input
                                className="form-control form-control-lg"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                style={{
                                    borderRadius: 12,
                                    background: '#F3F4F6',
                                    border: '1px solid #E5E7EB',
                                    padding: '14px 16px',
                                }}
                            />
                        </div>

                        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-lg w-100"
                                style={{
                                    backgroundColor: '#0B5648',
                                    color: '#FFFFFF',
                                    borderRadius: 12,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    fontWeight: 600
                                }}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>

                        <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <p style={{ color: '#718096', fontSize: '14px', marginBottom: 0 }}>
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    className="btn btn-link"
                                    style={{ color: '#0B5648', textDecoration: 'none', fontWeight: '600' }}
                                    onClick={() => navigate('/signin')}
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Panel - Image */}
                <div
                    style={{
                        flex: 1,
                        height: '400px',
                        backgroundImage: `url(${slides[current].image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 16,
                        border: '2px solid rgba(11,86,72,0.1)',
                        boxShadow: '0 8px 32px rgba(11,86,72,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            padding: '24px',
                            color: 'white'
                        }}
                    >
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{slides[current].title}</h3>
                        <p style={{ fontSize: '14px', marginBottom: 0, opacity: 0.9 }}>{slides[current].subTitle}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slide-up { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px) } to { opacity:1; transform: translateY(0) } }
                @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                .animate-fade-in { animation: fade-in .8s ease-out forwards; opacity: 0 }
                .animate-slide-up { animation: slide-up .6s ease-out forwards; opacity: 0 }
                .animate-fade-in-up { animation: fade-in-up .8s ease-out forwards; opacity: 0 }
                .animate-float { animation: float 4s ease-in-out infinite }
                .auth-bg-gradient { background: linear-gradient(to bottom, #F0EBE8, #FFFFFF) }
                .btn-link { text-decoration: none !important; }
                .btn-link:hover { text-decoration: none !important; }
            `}</style>
        </div>
    );
}

export default ForgotPassword;



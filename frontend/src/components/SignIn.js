import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [current, setCurrent] = useState(0);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const slides = [
        { id: 1, image: '/images/slide1.jpg', title: 'Track Buses Live', subTitle: 'Real-time tracking and seamless travel experience.' },
        { id: 2, image: '/images/slide2.jpg', title: 'Smart Ticketing', subTitle: 'Book, manage and ride without hassle.' },
        { id: 3, image: '/images/slide3.jpg', title: 'Plan Your Journey', subTitle: 'Find routes and schedules quickly.' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8070/auth/signin', { email, password });
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', 'dummy-token'); // Add token for session validation
                if (remember) localStorage.setItem('remember_email', email); else localStorage.removeItem('remember_email');
                
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    // Clear browser history to prevent back navigation
                    window.history.replaceState(null, '', '/');
                    
                    const userRole = response.data.user.role;
                    if (userRole === 'admin') navigate('/stoppage', { replace: true }); 
                    else navigate('/location', { replace: true });
                }, 2000);
            }
        } catch (error) {
            setErrors({ general: error?.response?.data?.message || 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="auth-bg-gradient d-flex align-items-center justify-content-center"
            style={{ 
                height: '100vh', 
                minHeight: '100vh',
                backgroundImage: `linear-gradient(rgba(20,33,61,0.6), rgba(0,0,0,0.5)), url(${slides[current].image})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                backgroundAttachment: 'fixed',
                padding: 0, 
                margin: 0 
            }}
        >
            <div
                className="w-100 max-w-6xl rounded-3xl overflow-hidden"
                style={{
                    maxWidth: 1200,
                    background: 'rgba(255,255,255,0.65)',
                    borderRadius: 24,
                    boxShadow: '0 24px 60px rgba(11,86,72,0.18)',
                    border: '1px solid rgba(255,255,255,0.45)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}
            >
                <div className="row g-0" style={{ minHeight: 600 }}>
                    <div className="col-lg-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
                        <div className="mb-4">
                            <div className="mb-2" style={{ lineHeight: 1 }}>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#0B5648' }}>ECO</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: '#0B5648' }}>transit</div>
                            </div>
                        </div>

                        <div className="mb-4 animate-fade-in">
                            <h2 className="fw-bold mb-2" style={{ fontSize: 28, color: '#0B5648' }}>Welcome Back!</h2>
                            <p className="m-0" style={{ color: '#4b5563' }}>Please enter log in details below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="">
                            {errors.general && (<div className="alert alert-danger py-2 mb-3">{errors.general}</div>)}
                            <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-control form-control-lg"
                                    style={{
                                        borderRadius: 12,
                                        background: '#F3F4F6',
                                        border: '1px solid #E5E7EB',
                                        padding: '14px 16px',
                                    }}
                                />
                                {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                            </div>
                            <div className="mb-3 position-relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control form-control-lg pe-5"
                                    style={{
                                        borderRadius: 12,
                                        background: '#F3F4F6',
                                        border: '1px solid #E5E7EB',
                                        padding: '14px 16px',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="btn btn-link position-absolute"
                                    style={{ right: '16px !important', top: '50%', transform: 'translateY(-50%)', color: '#0B5648', fontSize: '14px', fontWeight: '500' }}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                                <label className="d-inline-flex align-items-center gap-2 m-0">
                                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                    <span>Remember Me</span>
                                </label>
                                <button type="button" className="btn btn-link p-0" style={{ color: '#0B5648' }} onClick={() => navigate('/reset-password')}>Forgot password?</button>
                            </div>
                            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                <button type="submit" disabled={loading} className="btn btn-lg w-100" style={{ backgroundColor: '#0B5648', color: '#FFFFFF', borderRadius: 12, paddingTop: 12, paddingBottom: 12, fontWeight: 600 }}>
                                    {loading ? 'Signing In...' : 'Sign in'}
                                </button>
                            </div>
                            <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                                <span style={{ color: '#4b5563' }}>Don't have an account?</span>
                                <button type="button" className="btn btn-link" style={{ color: '#0B5648' }} onClick={() => navigate('/signup')}>Sign Up</button>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden p-4 p-lg-5" style={{ backgroundColor: '#0B5648' }}>
                        <div className="mb-4 animate-float">
                            <div className="border" style={{ width: 340, height: 340, borderRadius: 28, border: '1px solid rgba(255,255,255,0.28)', backgroundImage: `url(${slides[current].image})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }} />
                        </div>
                        <div className="text-center text-white animate-fade-in-up" style={{ animationDelay: '1s' }}>
                            <h3 className="fw-bold mb-3" style={{ marginBottom: 10 }}>Plan Your Journey</h3>
                            <p className="text-light" style={{ opacity: 0.95 }}>Find routes and schedules quickly.</p>
                            <div className="d-flex justify-content-center" style={{ gap: 8 }}>
                                <div className={`rounded-circle`} style={{ width: 10, height: 10, borderRadius: 999, background: current === 0 ? '#8CDB66' : 'rgba(255,255,255,0.35)' }} />
                                <div className={`rounded-circle`} style={{ width: 10, height: 10, borderRadius: 999, background: current === 1 ? '#8CDB66' : 'rgba(255,255,255,0.35)' }} />
                                <div className={`rounded-circle`} style={{ width: 10, height: 10, borderRadius: 999, background: current === 2 ? '#8CDB66' : 'rgba(255,255,255,0.35)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div 
                    className="position-fixed d-flex align-items-center justify-content-center"
                    style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <div 
                        className="bg-white rounded-3 p-4 text-center"
                        style={{
                            maxWidth: 400,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'slideInUp 0.3s ease-out'
                        }}
                    >
                        <div className="mb-3">
                            <div 
                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                style={{ 
                                    width: 60, 
                                    height: 60, 
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    fontSize: '24px'
                                }}
                            >
                                ✓
                            </div>
                        </div>
                        <h4 className="mb-2" style={{ color: '#0B5648' }}>Welcome Back!</h4>
                        <p className="text-muted mb-0">Sign in successful. Redirecting...</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slide-up { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
                @keyframes fade-in-up { from { opacity:0; transform: translateY(30px) } to { opacity:1; transform: translateY(0) } }
                @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                @keyframes slideInUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
                .animate-fade-in { animation: fade-in .8s ease-out forwards; opacity: 0 }
                .animate-slide-up { animation: slide-up .6s ease-out forwards; opacity: 0 }
                .animate-fade-in-up { animation: fade-in-up .8s ease-out forwards; opacity: 0 }
                .animate-float { animation: float 4s ease-in-out infinite }
                .auth-bg-gradient { background: linear-gradient(to bottom, #F0EBE8, #FFFFFF) }
                .btn-link { text-decoration: none !important; }
                .btn-link:hover { text-decoration: none !important; }
                .password-toggle-btn { right: 16px !important; }
                .position-absolute.btn-link { right: 16px !important; }
                button.position-absolute.btn-link { right: 16px !important; }
                .mb-3 button.position-absolute { right: 16px !important; }
                .animate-slide-up button.position-absolute { right: 16px !important; }
                /* Override all possible password toggle button styles */
                .password-toggle-btn, 
                .password-toggle-btn:hover, 
                .password-toggle-btn:active,
                .password-toggle-btn:focus { 
                    right: 16px !important; 
                    position: absolute !important;
                }
                /* Override any button with position absolute in password containers */
                .mb-3.position-relative button,
                .animate-slide-up.position-relative button,
                div[style*="position-relative"] button { 
                    right: 16px !important; 
                }
            `}</style>
        </div>
    );
}

export default SignIn;




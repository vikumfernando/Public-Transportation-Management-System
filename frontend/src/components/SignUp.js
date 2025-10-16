import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [current, setCurrent] = useState(0);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const slides = [
        { id: 1, image: '/images/slide1.jpg', title: 'Seamless Booking', subTitle: 'Reserve seats in seconds and ride comfortably.' },
        { id: 2, image: '/images/slide2.jpg', title: 'Secure Payments', subTitle: 'Pay with smart or visa cards safely.' },
        { id: 3, image: '/images/slide3.jpg', title: 'Discover Routes', subTitle: 'Explore routes and schedules effortlessly.' }
    ];

    useEffect(() => {
        const interval = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 8000);
        return () => clearInterval(interval);
    }, []);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const getPasswordStrengthText = (strength) => {
        if (strength <= 2) return { text: 'Weak', color: '#ef4444' };
        if (strength <= 4) return { text: 'Medium', color: '#f59e0b' };
        return { text: 'Strong', color: '#10b981' };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) newErrors.password = 'Password is required';
        else if (!passwordRegex.test(formData.password)) newErrors.password = 'Password must be 8+ chars with upper, lower, number, special';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8070/auth/signup', formData);
            if (response.data.success) {
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    window.history.replaceState(null, '', '/signin');
                    navigate('/signin', { replace: true });
                }, 2000);
            }
        } catch (error) {
            setErrors({ general: error?.response?.data?.message || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '@$!%*?&';
        let password = '';
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        const allChars = lowercase + uppercase + numbers + symbols;
        const remainingLength = Math.floor(Math.random() * 5) + 8;
        for (let i = 0; i < remainingLength; i++) password += allChars[Math.floor(Math.random() * allChars.length)];
        const finalPwd = password.split('').sort(() => Math.random() - 0.5).join('');
        setFormData(prev => ({ ...prev, password: finalPwd, confirmPassword: finalPwd }));
        setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setPasswordStrength(calculatePasswordStrength(finalPwd));
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
                            <h2 className="fw-bold mb-2" style={{ fontSize: 28, color: '#0B5648' }}>Create Account</h2>
                            <p className="m-0" style={{ color: '#4b5563' }}>Please fill your details below</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errors.general && (<div className="alert alert-danger py-2 mb-3">{errors.general}</div>)}
                            <div className="row">
                                <div className="col-12 col-md-6 mb-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <input className="form-control form-control-lg" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                    {errors.firstName && <div className="text-danger small mt-1">{errors.firstName}</div>}
                                </div>
                                <div className="col-12 col-md-6 mb-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                                    <input className="form-control form-control-lg" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                    {errors.lastName && <div className="text-danger small mt-1">{errors.lastName}</div>}
                                </div>
                            </div>
                            <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <input className="form-control form-control-lg" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                            </div>
                            <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                                <input className="form-control form-control-lg" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                            </div>
                            <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                <input className="form-control form-control-lg" type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                
                                {/* Password Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small style={{ color: '#6b7280' }}>Password Strength:</small>
                                            <small style={{ color: getPasswordStrengthText(passwordStrength).color, fontWeight: '600' }}>
                                                {getPasswordStrengthText(passwordStrength).text}
                                            </small>
                                        </div>
                                        <div className="progress" style={{ height: '4px', borderRadius: '2px' }}>
                                            <div 
                                                className="progress-bar" 
                                                style={{ 
                                                    width: `${(passwordStrength / 6) * 100}%`, 
                                                    backgroundColor: getPasswordStrengthText(passwordStrength).color,
                                                    borderRadius: '2px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="d-flex justify-content-end mt-2">
                                    <button type="button" className="btn btn-sm" style={{ border: '1px solid #0B5648', color: '#0B5648' }} onClick={handleGeneratePassword}>Generate password</button>
                                </div>
                                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                            </div>
                            <div className="mb-3 animate-slide-up position-relative" style={{ animationDelay: '0.45s' }}>
                                <input className="form-control form-control-lg pe-5" type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" style={{ borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '14px 16px' }} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="btn btn-link position-absolute" style={{ right: '16px !important', top: '50%', transform: 'translateY(-50%)', color: '#0B5648', fontSize: '14px', fontWeight: '500' }}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                                {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword}</div>}
                            </div>
                            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                <button type="submit" disabled={loading} className="btn btn-lg w-100" style={{ backgroundColor: '#0B5648', color: '#FFFFFF', borderRadius: 12, paddingTop: 12, paddingBottom: 12, fontWeight: 600 }}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
                            </div>
                            <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                                <span style={{ color: '#4b5563' }}>Already have an account?</span>
                                <button type="button" className="btn btn-link" style={{ color: '#0B5648' }} onClick={() => navigate('/signin')}>Sign In</button>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden p-4 p-lg-5" style={{ backgroundColor: '#0B5648' }}>
                        <div className="mb-4 animate-float">
                            <div className="border" style={{ width: 340, height: 340, borderRadius: 28, border: '1px solid rgba(255,255,255,0.28)', backgroundImage: `url(${slides[current].image})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }} />
                        </div>
                        <div className="text-center text-white animate-fade-in-up" style={{ animationDelay: '1s' }}>
                            <h3 className="fw-bold mb-3" style={{ marginBottom: 10 }}>{slides[current].title}</h3>
                            <p className="text-light" style={{ opacity: 0.95 }}>{slides[current].subTitle}</p>
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
                        <h4 className="mb-2" style={{ color: '#0B5648' }}>Account Created Successfully!</h4>
                        <p className="text-muted mb-0">Redirecting to sign in page...</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slide-up { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px) } to { opacity:1; transform: translateY(0) } }
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

export default SignUp;


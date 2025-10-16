import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [reEnteredPassword, setReEnteredPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [current, setCurrent] = useState(0);

    const slides = [
        { id: 1, image: '/images/slide1.jpg', title: 'Secure Reset', subTitle: 'We’ll verify and help you reset quickly.' },
        { id: 2, image: '/images/slide2.jpg', title: 'One-Time Code', subTitle: 'Enter the 6-digit code from your email.' },
        { id: 3, image: '/images/slide3.jpg', title: 'Create New Password', subTitle: 'Choose a strong, memorable password.' }
    ];

    useEffect(() => {
        if (location.state && location.state.email) setEmail(location.state.email);
    }, [location.state]);

    useEffect(() => {
        const interval = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 8000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = async () => {
        if (!email) { setMessage('Please enter your email'); return; }
        const isValidEmail = /\S+@\S+\.\S+/.test(email);
        if (!isValidEmail) { setMessage('Invalid email'); return; }
        setLoading(true);
        try {
            await axios.post('http://localhost:8070/auth/forgot-password', { email });
            setMessage('Password reset code sent to your email!');
            setPage(1);
        } catch (e) {
            setMessage('If the email exists, a code has been sent.');
            setPage(1);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp) { setMessage('Please enter verification code'); return; }
        const isValidCode = /^\d{6}$/.test(otp);
        if (!isValidCode) { setMessage('Invalid verification code format'); return; }
        setLoading(true);
        try {
            await axios.post('http://localhost:8070/auth/verify-otp', { email, otp });
            setMessage('Verification successful!');
            setPage(2);
        } catch (e) {
            setMessage('Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!password || !reEnteredPassword) { setMessage('Please fill the given fields'); return; }
        const passwordValid = /^.{6,}$/.test(password) && /^.{6,}$/.test(reEnteredPassword);
        if (!passwordValid) { setMessage('Password must be at least 6 characters long'); return; }
        if (password !== reEnteredPassword) { setMessage('Passwords not matching'); return; }
        setLoading(true);
        try {
            await axios.post('http://localhost:8070/auth/reset-password', { email, otp, password, confirmPassword: reEnteredPassword });
            setMessage('Password changed successfully!');
            navigate('/signin');
        } catch (e) {
            setMessage('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen auth-bg-gradient p-4 d-flex align-items-center justify-content-center"
            style={{ 
                height: '100vh',
                minHeight: '100vh',
                backgroundImage: `linear-gradient(rgba(20,33,61,0.8), rgba(0,0,0,0.7)), url(${slides[current].image})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="w-100 max-w-6xl rounded-3xl shadow-lg overflow-hidden" style={{ maxWidth: 1200, background: '#FFFFFFE6' }}>
                <div className="row g-0" style={{ minHeight: 600 }}>
                    <div className="col-lg-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
                        <div className="mb-4 mt-4">
                            <div className="d-flex align-items-center mb-2">
                                <img src="/images/siteLogo.png" alt="Logo" style={{ height: 36, width: 'auto' }} />
                                <div className="ms-2" style={{ width: 8, height: 8, background: '#8CDB66', borderRadius: 999 }} />
                            </div>
                        </div>

                        {page === 0 && (
                            <>
                                <div className="mb-4 animate-fade-in">
                                    <h2 className="fw-bold mb-2" style={{ fontSize: 28, color: '#0B5648' }}>Reset password</h2>
                                    <p className="m-0" style={{ color: '#4b5563' }}>Please enter registered email below</p>
                                </div>
                                {message && <div className="alert alert-info py-2">{message}</div>}
                                <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-lg" />
                                </div>
                                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                    <button type="button" onClick={handleNext} className="btn btn-dark btn-lg w-100" disabled={loading}>{loading ? 'Sending...' : 'Next'}</button>
                                </div>
                                <div className="text-center mt-4 animate-fade-in mb-5" style={{ animationDelay: '0.8s' }}>
                                    <span style={{ color: '#4b5563' }}>Back to </span>
                                    <button onClick={() => navigate('/signin')} className="btn btn-link">Login</button>
                                </div>
                            </>
                        )}

                        {page === 1 && (
                            <>
                                <div className="mb-4 animate-fade-in">
                                    <h2 className="fw-bold mb-2" style={{ fontSize: 28, color: '#0B5648' }}>Verify</h2>
                                    <p className="m-0" style={{ color: '#4b5563' }}>We sent a password reset code to {email}</p>
                                </div>
                                {message && <div className="alert alert-info py-2">{message}</div>}
                                <div className="mb-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <input type="text" placeholder="Password reset code" value={otp} onChange={(e) => setOtp(e.target.value)} className="form-control form-control-lg" />
                                </div>
                                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                    <button type="button" onClick={handleVerify} className="btn btn-dark btn-lg w-100" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
                                </div>
                                <div className="text-center mt-4 animate-fade-in mb-5" style={{ animationDelay: '0.8s' }}>
                                    <span style={{ color: '#4b5563' }}>Back to </span>
                                    <button onClick={() => navigate('/signin')} className="btn btn-link">Login</button>
                                </div>
                            </>
                        )}

                        {page === 2 && (
                            <>
                                <div className="mb-4 animate-fade-in">
                                    <h2 className="fw-bold mb-2" style={{ fontSize: 28, color: '#0B5648' }}>Reset password</h2>
                                    <p className="m-0" style={{ color: '#4b5563' }}>Please fill below fields</p>
                                </div>
                                {message && <div className="alert alert-info py-2">{message}</div>}
                                <div className="mb-3 position-relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-lg pe-5" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link position-absolute" style={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}>{showPassword ? 'Hide' : 'Show'}</button>
                                </div>
                                <div className="mb-3 position-relative animate-slide-up" style={{ animationDelay: '0.35s' }}>
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={reEnteredPassword} onChange={(e) => setReEnteredPassword(e.target.value)} className="form-control form-control-lg pe-5" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link position-absolute" style={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}>{showPassword ? 'Hide' : 'Show'}</button>
                                </div>
                                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                    <button type="button" onClick={handleSubmit} className="btn btn-lg w-100" style={{ backgroundColor: '#0B5648', color: '#FFFFFF' }} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                                </div>
                                <div className="text-center mt-4 animate-fade-in mb-5" style={{ animationDelay: '0.8s' }}>
                                    <span style={{ color: '#4b5563' }}>Back to </span>
                                    <button onClick={() => navigate('/signin')} className="btn btn-link" style={{ color: '#0B5648' }}>Login</button>
                </div>
                            </>
                        )}
                    </div>
                    <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden p-4 p-lg-5" style={{ backgroundColor: '#0B5648' }}>
                        <div className="mb-4 animate-float">
                            <div className="border" style={{ width: 320, height: 320, borderRadius: 24, borderColor: 'rgba(59,130,246,0.3)', backgroundImage: `url(${slides[current].image})`, backgroundSize: 'cover' }} />
                        </div>
                        <div className="text-center text-white animate-fade-in-up" style={{ animationDelay: '1s' }}>
                            <h3 className="fw-bold mb-3">{slides[current].title}</h3>
                            <p className="text-light" style={{ opacity: 0.9 }}>{slides[current].subTitle}</p>
                            <div className="d-flex justify-content-center gap-2">
                                <div className={`rounded-circle`} style={{ width: 8, height: 8, background: current === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                                <div className={`rounded-circle`} style={{ width: 8, height: 8, background: current === 1 ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                                <div className={`rounded-circle`} style={{ width: 8, height: 8, background: current === 2 ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                    </div>
                        </div>
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
            `}</style>
        </div>
    );
}

export default ResetPassword;

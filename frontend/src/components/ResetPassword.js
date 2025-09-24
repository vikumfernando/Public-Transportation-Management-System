import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (location.state && location.state.email) {
            setForm(prev => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) newErrors.email = 'Email is required';
        if (!form.otp.trim()) newErrors.otp = 'OTP is required';
        if (!form.password) newErrors.password = 'Password is required';
        if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
        if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!validate()) return;
        setLoading(true);
        try {
            // Optional: verify OTP before reset, but reset endpoint checks too
            await axios.post('/auth/verify-otp', { email: form.email, otp: form.otp }, { timeout: 15000 });
            const res = await axios.post('/auth/reset-password', form, { timeout: 15000 });
            if (res.data && res.data.success) {
                setMessage('Password reset successful. Redirecting to sign in...');
                setTimeout(() => navigate('/signin'), 1000);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Reset failed. Check your OTP and try again.';
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ '--auth-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset Password</h1>
                    <p>Enter the OTP sent to your email and choose a new password</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {message && <div className="success-message">{message}</div>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="otp">OTP</label>
                        <input id="otp" name="otp" type="text" value={form.otp} onChange={handleChange} placeholder="6-digit code" />
                        {errors.otp && <span className="error-message">{errors.otp}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button
                                type="button"
                                className="generate-password-btn"
                                onClick={() => setForm(prev => ({ ...prev, password: (function(){
                                    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
                                    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                    const numbers = '0123456789';
                                    const symbols = '@$!%*?&';
                                    let pwd = '';
                                    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
                                    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
                                    pwd += numbers[Math.floor(Math.random() * numbers.length)];
                                    pwd += symbols[Math.floor(Math.random() * symbols.length)];
                                    const all = lowercase + uppercase + numbers + symbols;
                                    const remaining = Math.floor(Math.random() * 5) + 8;
                                    for (let i = 0; i < remaining; i++) {
                                        pwd += all[Math.floor(Math.random() * all.length)];
                                    }
                                    return pwd.split('').sort(() => Math.random() - 0.5).join('');
                                })(), confirmPassword: (function(v){ return v; })(
                                    (function(){
                                        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
                                        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                        const numbers = '0123456789';
                                        const symbols = '@$!%*?&';
                                        let pwd = '';
                                        pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
                                        pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
                                        pwd += numbers[Math.floor(Math.random() * numbers.length)];
                                        pwd += symbols[Math.floor(Math.random() * symbols.length)];
                                        const all = lowercase + uppercase + numbers + symbols;
                                        const remaining = Math.floor(Math.random() * 5) + 8;
                                        for (let i = 0; i < remaining; i++) {
                                            pwd += all[Math.floor(Math.random() * all.length)];
                                        }
                                        return pwd.split('').sort(() => Math.random() - 0.5).join('');
                                    })()
                                ) }))}
                                title="Generate secure password"
                            >
                                Generate password
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;

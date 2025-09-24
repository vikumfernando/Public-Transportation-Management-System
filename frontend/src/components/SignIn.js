import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

function SignIn() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isValidEmail = (value) => /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)$/.test(value);

    // Auto-dismiss general error after 3s
    useEffect(() => {
        if (errors.general) {
            const t = setTimeout(() => setErrors(prev => ({ ...prev, general: '' })), 3000);
            return () => clearTimeout(t);
        }
    }, [errors.general]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const newErrors = { ...errors };
        if (name === 'email') {
            if (!value.trim()) newErrors.email = 'Email is required';
            else if (!isValidEmail(value)) newErrors.email = 'Please enter a valid email address';
            else newErrors.email = '';
        }
        if (name === 'password') {
            if (!value) newErrors.password = 'Password is required';
            else newErrors.password = '';
        }
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/auth/signin', formData, { timeout: 15000 });
            
            if (response.data.success) {
                // Store user data in localStorage (you might want to use a more secure method)
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Redirect to main page (home page)
                navigate('/');
            }
        } catch (error) {
            const message = error?.response?.data?.message
                || (error?.code === 'ECONNABORTED' ? 'Request timed out. Please try again.'
                : (error?.message?.includes('Network') ? 'Cannot reach server. Is the backend running?' : 'Login failed. Please try again.'));
            setErrors({ general: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">TH</div>
                        <div className="auth-logo-text">Transportation Hub</div>
                    </div>
                    <h1>Sign In</h1>
                    <p>Welcome back! Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.email ? 'error' : ''}
                            placeholder="Enter your email address"
                            autoComplete="email"
                            required
                        />
                        {/* inline error hidden per request */}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.password ? 'error' : ''}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {/* inline error hidden per request */}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;


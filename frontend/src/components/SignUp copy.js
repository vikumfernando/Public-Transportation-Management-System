import React, { useState, useEffect } from 'react';
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
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: [],
        color: '#e2e8f0'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let score = 0;
        const feedback = [];
        
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('At least 8 characters');
        }
        
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Lowercase letter');
        }
        
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Uppercase letter');
        }
        
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Number');
        }
        
        if (/[@$!%*?&]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Special character (@$!%*?&)');
        }
        
        // Bonus points for length
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        
        let strengthLevel = 'Very Weak';
        let color = '#e53e3e';
        
        if (score >= 7) {
            strengthLevel = 'Very Strong';
            color = '#0b5648';
        } else if (score >= 6) {
            strengthLevel = 'Strong';
            color = '#8cdb66';
        } else if (score >= 4) {
            strengthLevel = 'Medium';
            color = '#f6ad55';
        } else if (score >= 2) {
            strengthLevel = 'Weak';
            color = '#fc8181';
        }
        
        return {
            score: Math.min(score, 5),
            feedback,
            strengthLevel,
            color
        };
    };

    // Password generator
    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '@$!%*?&';
        
        let password = '';
        
        // Ensure at least one character from each category
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill the rest randomly (total length 12-16)
        const allChars = lowercase + uppercase + numbers + symbols;
        const remainingLength = Math.floor(Math.random() * 5) + 8; // 8-12 additional chars
        
        for (let i = 0; i < remainingLength; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setFormData(prev => ({
            ...prev,
            password: newPassword,
            confirmPassword: newPassword
        }));
        
        // Update password strength
        const strength = checkPasswordStrength(newPassword);
        setPasswordStrength(strength);
        
        // Clear any existing password errors
        setErrors(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
        }));
    };

    const isValidEmail = (value) => /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)$/.test(value);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Update password strength for password field
        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }
        
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
        const nextErrors = { ...errors };
        if (name === 'firstName' && !value.trim()) nextErrors.firstName = 'First name is required';
        if (name === 'lastName' && !value.trim()) nextErrors.lastName = 'Last name is required';
        if (name === 'phone') {
            const phoneRegex = /^\d{10}$/;
            if (!value.trim()) nextErrors.phone = 'Phone number is required';
            else if (!phoneRegex.test(value)) nextErrors.phone = 'Phone number must be exactly 10 digits';
            else nextErrors.phone = '';
        }
        if (name === 'email') {
            if (!value.trim()) nextErrors.email = 'Email is required';
            else if (!isValidEmail(value)) nextErrors.email = 'Please enter a valid email address';
            else nextErrors.email = '';
        }
        if (name === 'password') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!value) nextErrors.password = 'Password is required';
            else if (!passwordRegex.test(value)) nextErrors.password = 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character';
            else nextErrors.password = '';
        }
        if (name === 'confirmPassword') {
            if (!value) nextErrors.confirmPassword = 'Please confirm your password';
            else if (value !== formData.password) nextErrors.confirmPassword = 'Passwords do not match';
            else nextErrors.confirmPassword = '';
        }
        setErrors(nextErrors);
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Phone validation: exactly 10 digits
        const phoneRegex = /^\d{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await axios.post('/auth/signup', formData, { timeout: 15000 });
            
            if (response.data.success) {
                alert('Registration successful! Please sign in.');
                navigate('/signin');
            }
        } catch (error) {
            const message = error?.response?.data?.message
                || (error?.code === 'ECONNABORTED' ? 'Request timed out. Please try again.'
                : (error?.message?.includes('Network') ? 'Cannot reach server. Is the backend running?' : 'Registration failed. Please try again.'));
            setErrors({ general: message });
        } finally {
            setLoading(false);
        }
    };

    // Auto-dismiss general error after 3s
    useEffect(() => {
        if (errors.general) {
            const t = setTimeout(() => setErrors(prev => ({ ...prev, general: '' })), 3000);
            return () => clearTimeout(t);
        }
    }, [errors.general]);

    return (
        <div className="auth-container" style={{ '--auth-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">TH</div>
                        <div className="auth-logo-text">Transportation Hub</div>
                    </div>
                    <h1>Sign Up</h1>
                    <p>Create your account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.firstName ? 'error' : ''}
                                placeholder="Enter your first name"
                                required
                            />
                            {/* inline error hidden per request */}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.lastName ? 'error' : ''}
                                placeholder="Enter your last name"
                                required
                            />
                            {/* inline error hidden per request */}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                            <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            className={errors.phone ? 'error' : ''}
                            placeholder="Enter your phone number"
                                required
                        />
                        {/* inline error hidden per request */}
                    </div>

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
                                required
                        />
                        {/* inline error hidden per request */}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.password ? 'error' : ''}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="password-strength-container">
                                <div className="strength-meter">
                                    <div className="strength-meter-fill" 
                                         style={{
                                             width: `${(passwordStrength.score / 5) * 100}%`,
                                             backgroundColor: passwordStrength.color
                                         }}>
                                    </div>
                                </div>
                                <div className="strength-info">
                                    <span className="strength-level" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.strengthLevel}
                                    </span>
                                    {passwordStrength.feedback.length > 0 && (
                                        <div className="strength-feedback">
                                            <small>Missing: {passwordStrength.feedback.join(', ')}</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button
                                type="button"
                                className="generate-password-btn"
                                onClick={handleGeneratePassword}
                                title="Generate secure password"
                            >
                                Generate password
                            </button>
                        </div>
                        
                        {/* inline error hidden per request */}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {/* inline error hidden per request */}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/signin">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;


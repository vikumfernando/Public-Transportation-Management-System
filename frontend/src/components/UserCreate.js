import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserCreate.css";

function UserCreate() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'passenger'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        // Check required fields
        if (!formData.firstName.trim() || !formData.lastName.trim() || 
            !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
            setError('Please fill in all required fields');
            return false;
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Phone validation: exactly 10 digits
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Phone number must be exactly 10 digits');
            return false;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must contain at least 8 characters including uppercase, lowercase, number, and special character');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError('');

            const createData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            };

            const response = await axios.post('http://localhost:8070/users', createData, { timeout: 15000 });
            
            if (response.data.success) {
                setSuccess('User created successfully!');
                // Redirect to user management after 2 seconds
                setTimeout(() => {
                    navigate('/users');
                }, 800);
            }
        } catch (error) {
            console.error('Create user error:', error);
            setError(error.response?.data?.message || 'Failed to create user');
        } finally {
            setSaving(false);
        }
    };

    // Auto-dismiss alerts after 3s
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(t);
        }
    }, [error]);
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    const handleCancel = () => {
        navigate('/users');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#d69e2e';
            case 'driver': return '#38a169';
            case 'passenger': return '#3182ce';
            default: return '#718096';
        }
    };

    const getRoleDescription = (role) => {
        switch (role) {
            case 'admin': return 'Full system access and management capabilities';
            case 'driver': return 'Access to driver-specific features and routes';
            case 'passenger': return 'Basic user access for booking and tracking';
            default: return 'Standard user privileges';
        }
    };

    return (
        <div className="create-user-container" style={{ '--page-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            {/* Header */}
            <div className="create-header">
                <button onClick={handleCancel} className="back-button">
                    ← Back to Users
                </button>
                <div className="header-info">
                    <h1>Create New User</h1>
                    <p>Add a new user to the transportation management system</p>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">!</span>
                    {error}
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✓</span>
                    {success}
                </div>
            )}

            {/* User Preview Card */}
            <div className="user-preview-card">
                <div className="preview-avatar">
                    <div className="avatar-circle" style={{ backgroundColor: getRoleColor(formData.role) }}>
                        {formData.firstName?.charAt(0) || 'F'}{formData.lastName?.charAt(0) || 'L'}
                    </div>
                    <div className="role-badge" style={{ backgroundColor: getRoleColor(formData.role) }}>
                        {formData.role?.toUpperCase() || 'USER'}
                    </div>
                </div>
                <div className="preview-info">
                    <h3>{formData.firstName || 'First Name'} {formData.lastName || 'Last Name'}</h3>
                    <p>{formData.email || 'email@example.com'}</p>
                    <small>Live preview of new user</small>
                </div>
                <div className="role-description">
                    <strong>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Role</strong>
                    <p>{getRoleDescription(formData.role)}</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="create-form-container">
                <form onSubmit={handleSubmit} className="create-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">
                                    First Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">
                                    Last Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Contact Information</h3>
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone Number <span className="required">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Account Settings</h3>
                        <div className="form-group">
                            <label htmlFor="role">
                                User Role <span className="required">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="passenger">Passenger - Standard user access</option>
                                <option value="driver">Driver - Vehicle operation access</option>
                                <option value="admin">Admin - Full system management</option>
                            </select>
                            <small className="form-hint">
                                {getRoleDescription(formData.role)}
                            </small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Security</h3>
                        <div className="form-group">
                            <label htmlFor="password">
                                Password <span className="required">*</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter secure password"
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
                            <small className="form-hint">
                                Must contain at least 8 characters including uppercase, lowercase, number, and special character
                            </small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm Password <span className="required">*</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Confirm password"
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
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handleCancel} 
                            className="cancel-btn"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="create-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserCreate;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserEditProfile.css";

function UserEditProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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
    const [originalUser, setOriginalUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/users/${id}`);
            if (response.data.success) {
                const user = response.data.user;
                setOriginalUser(user);
                setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    password: '',
                    confirmPassword: '',
                    role: user.role
                });
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

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
            !formData.email.trim() || !formData.phone.trim()) {
            setError('Please fill in all required fields');
            return false;
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Phone number must be exactly 10 digits');
            return false;
        }

        // Password validation (if password is provided)
        if (formData.password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError('Password must contain at least 8 characters including uppercase, lowercase, number, and special character');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
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

            // Prepare update data
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            };

            // Only include password if it's provided
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await axios.put(`/users/${id}`, updateData);
            
            if (response.data.success) {
                setSuccess('User profile updated successfully!');
                // Redirect to profile view after 2 seconds
                setTimeout(() => {
                    navigate(`/users/view/${id}`);
                }, 2000);
            }
        } catch (error) {
            console.error('Update error:', error);
            setError(error.response?.data?.message || 'Failed to update user profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/users/view/${id}`);
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#d69e2e';
            case 'driver': return '#38a169';
            case 'passenger': return '#3182ce';
            default: return '#718096';
        }
    };

    const hasChanges = () => {
        if (!originalUser) return false;
        
        return formData.firstName !== originalUser.firstName ||
               formData.lastName !== originalUser.lastName ||
               formData.email !== originalUser.email ||
               formData.phone !== originalUser.phone ||
               formData.role !== originalUser.role ||
               formData.password !== '';
    };

    if (loading) {
        return (
            <div className="edit-profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading user data...</p>
                </div>
            </div>
        );
    }

    if (!originalUser) {
        return (
            <div className="edit-profile-container">
                <div className="error-message">
                    <div className="error-icon">!</div>
                    <h3>User Not Found</h3>
                    <p>The requested user could not be found.</p>
                    <button onClick={() => navigate('/users')} className="back-btn">
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-container" style={{ '--page-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            {/* Header */}
            <div className="edit-header">
                <button onClick={handleCancel} className="back-button">
                    ← Back to Profile
                </button>
                <div className="header-info">
                    <h1>Edit User Profile</h1>
                    <p>Update user information and settings</p>
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
                        {formData.firstName?.charAt(0) || 'U'}{formData.lastName?.charAt(0) || 'U'}
                    </div>
                    <div className="role-badge" style={{ backgroundColor: getRoleColor(formData.role) }}>
                        {formData.role?.toUpperCase() || 'USER'}
                    </div>
                </div>
                <div className="preview-info">
                    <h3>{formData.firstName || 'First Name'} {formData.lastName || 'Last Name'}</h3>
                    <p>{formData.email || 'email@example.com'}</p>
                    <small>Live preview of changes</small>
                </div>
            </div>

            {/* Edit Form */}
            <div className="edit-form-container">
                <form onSubmit={handleSubmit} className="edit-form">
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
                                <option value="passenger">Passenger</option>
                                <option value="driver">Driver</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Password (Optional)</h3>
                        <p className="section-description">
                            Leave password fields empty to keep the current password
                        </p>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password (optional)"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    disabled={!formData.password}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <small className="form-hint">
                                Must contain at least 8 characters including uppercase, lowercase, number, and special character
                            </small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                    disabled={!formData.password}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                    disabled={!formData.password}
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
                            className="save-btn"
                            disabled={saving || !hasChanges()}
                        >
                            {saving ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserEditProfile;

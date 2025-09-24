import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserProfile.css";

function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8070/users/${id}`);
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setError('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/users/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await axios.delete(`http://localhost:8070/users/${id}`);
                if (response.data.success) {
                    alert('User deleted successfully');
                    navigate('/users');
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#d69e2e';
            case 'driver': return '#38a169';
            case 'passenger': return '#3182ce';
            default: return '#718096';
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Profile</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/users')} className="back-btn">
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    <div className="error-icon">👤</div>
                    <h3>User Not Found</h3>
                    <p>The requested user profile could not be found.</p>
                    <button onClick={() => navigate('/users')} className="back-btn">
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Header */}
            <div className="profile-header">
                <button onClick={() => navigate('/users')} className="back-button">
                    ← Back to Users
                </button>
                <div className="profile-actions">
                    <button onClick={handleEdit} className="edit-profile-btn">
                        ✏️ Edit Profile
                    </button>
                    <button onClick={handleDelete} className="delete-profile-btn">
                        🗑️ Delete User
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-avatar">
                    <div className="avatar-circle" style={{ backgroundColor: getRoleColor(user.role) }}>
                        {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                    </div>
                    <div className="role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
                        {user.role?.toUpperCase() || 'USER'}
                    </div>
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">{user.firstName || 'Unknown'} {user.lastName || 'User'}</h1>
                    <p className="profile-email">{user.email || 'No email provided'}</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="profile-details">
                <h2>User Details</h2>
                
                <div className="details-grid">
                    <div className="detail-item">
                        <div className="detail-label">Full Name</div>
                        <div className="detail-value">{user.firstName || 'Unknown'} {user.lastName || 'User'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Email Address</div>
                        <div className="detail-value">{user.email || 'No email provided'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Phone Number</div>
                        <div className="detail-value">{user.phone || 'No phone number provided'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">User Role</div>
                        <div className="detail-value">
                            <span className={`role-tag role-${user.role || 'passenger'}`}>
                                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Passenger'}
                            </span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Account Created</div>
                        <div className="detail-value">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Last Updated</div>
                        <div className="detail-value">{user.updatedAt ? formatDate(user.updatedAt) : 'Unknown'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">User ID</div>
                        <div className="detail-value user-id">{user._id || 'Unknown'}</div>
                    </div>
                </div>
            </div>

            {/* Activity Section */}
            <div className="profile-activity">
                <h2>Account Activity</h2>
                <div className="activity-stats">
                    <div className="activity-item">
                        <div className="activity-icon">📅</div>
                        <div className="activity-info">
                            <div className="activity-title">Member Since</div>
                            <div className="activity-value">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">🔄</div>
                        <div className="activity-info">
                            <div className="activity-title">Profile Updated</div>
                            <div className="activity-value">
                                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-info">
                            <div className="activity-title">Account Type</div>
                            <div className="activity-value">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Passenger'} Account</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;

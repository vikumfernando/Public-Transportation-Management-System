import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserManagement.css";

function UserManagement() {
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({
        passengers: 0,
        drivers: 0,
        admins: 0,
        total: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUserStats();
        fetchUsers();
    }, [selectedRole, searchTerm]);

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

    const fetchUserStats = async () => {
        try {
            const response = await axios.get('/users/stats');
            if (response.data.success) {
                setUserStats(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
            setError('Failed to load user statistics');
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let params = new URLSearchParams();
            
            if (selectedRole !== 'all') {
                params.append('role', selectedRole);
            }
            
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }
            
            const queryString = params.toString();
            const url = queryString ? `/users?${queryString}` : '/users';
            
            const response = await axios.get(url);
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await axios.delete(`/users/${userId}`);
                if (response.data.success) {
                    setSuccess('User deleted successfully');
                    fetchUsers();
                    fetchUserStats();
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleViewUser = (userId) => {
        navigate(`/users/view/${userId}`);
    };

    const handleEditUser = (userId) => {
        navigate(`/users/edit/${userId}`);
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="user-management">
            {/* Header Section */}
            <div className="user-management-header">
                <h1 className="user-management-title">User Management</h1>
                <p className="user-management-subtitle">
                    Manage passengers, drivers, and administrators in your transportation system
                </p>
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
                    <button onClick={() => setSuccess('')} className="alert-close">×</button>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-container">
                <div className="stat-card passengers">
                    <div className="stat-header">
                        <div className="stat-icon">P</div>
                    </div>
                    <div className="stat-title">Passengers</div>
                    <div className="stat-number">{userStats.passengers}</div>
                    <div className="stat-trend">
                        <span>↗</span> Active users
                    </div>
                </div>
                <div className="stat-card drivers">
                    <div className="stat-header">
                        <div className="stat-icon">D</div>
                    </div>
                    <div className="stat-title">Drivers</div>
                    <div className="stat-number">{userStats.drivers}</div>
                    <div className="stat-trend">
                        <span>→</span> Available drivers
                    </div>
                </div>
                <div className="stat-card admins">
                    <div className="stat-header">
                        <div className="stat-icon">A</div>
                    </div>
                    <div className="stat-title">Administrators</div>
                    <div className="stat-number">{userStats.admins}</div>
                    <div className="stat-trend">
                        <span>⚡</span> System managers
                    </div>
                </div>
            </div>

            {/* User Management Controls */}
            <div className="user-controls">
                <div className="filter-section">
                    <label htmlFor="roleFilter">Filter by Role:</label>
                    <select 
                        id="roleFilter"
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="role-filter"
                    >
                        <option value="all">All Users ({userStats.total})</option>
                        <option value="passenger">Passengers ({userStats.passengers})</option>
                        <option value="driver">Drivers ({userStats.drivers})</option>
                        <option value="admin">Admins ({userStats.admins})</option>
                    </select>
                </div>
                
                <div className="search-section">
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleCreateUser}
                    className="create-user-btn"
                >
                    <span>+</span> Create New User
                </button>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <div className="table-header">
                    <h3 className="table-title">User Directory</h3>
                    <p className="table-subtitle">
                        {users.length} {selectedRole === 'all' ? 'total' : selectedRole} user{users.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Name</th>
                            <th>Contact Information</th>
                            <th>Role</th>
                            <th>Member Since</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading">
                                    <div className="loading-spinner"></div>
                                    <br />
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-users">
                                    <div className="no-users-icon">👤</div>
                                    <br />
                                    No users found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-avatar" style={{
                                            background: user.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                                      user.role === 'driver' ? 'linear-gradient(135deg, #10b981, #047857)' :
                                                      'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                        }}>
                                            {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-details">
                                            <h4>{user.firstName} {user.lastName}</h4>
                                            <p>ID: {user._id?.slice(-8)}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <a href={`mailto:${user.email}`} className="email-link">
                                                {user.email}
                                            </a>
                                            <span className="phone-number">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleViewUser(user._id)}
                                                className="view-btn"
                                                title="View Profile"
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={() => handleEditUser(user._id)}
                                                className="edit-btn"
                                                title="Edit User"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="delete-btn"
                                                title="Delete User"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default UserManagement;

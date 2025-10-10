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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'passenger'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUserStats();
        fetchUsers();
    }, [selectedRole]);

    const fetchUserStats = async () => {
        try {
            const response = await axios.get('http://localhost:8070/users/stats');
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
            const roleParam = selectedRole !== 'all' ? `?role=${selectedRole}` : '';
            const response = await axios.get(`http://localhost:8070/users${roleParam}`);
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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8070/users', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            });
            if (response.data.success) {
                setSuccess('User created successfully');
                setShowCreateModal(false);
                resetForm();
                fetchUsers();
                fetchUserStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password; // Don't update password if not provided
            }
            // Role cannot be changed from edit screen
            delete updateData.role;
            
            const response = await axios.put(`http://localhost:8070/users/${editingUser._id}`, updateData);
            if (response.data.success) {
                setSuccess('User updated successfully');
                setShowEditModal(false);
                setEditingUser(null);
                resetForm();
                fetchUsers();
                fetchUserStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await axios.delete(`http://localhost:8070/users/${userId}`);
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            password: '',
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleViewUser = (user) => {
        // Navigate to dedicated view page
        navigate(`/users/${user._id}`);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            role: 'passenger'
        });
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setEditingUser(null);
        setViewingUser(null);
        resetForm();
        setError('');
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
            {/* Alert Messages */}
            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    {success}
                    <button onClick={() => setSuccess('')} className="alert-close">×</button>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-container">
                <div className="stat-card passengers">
                    <div className="stat-title">Passengers</div>
                    <div className="stat-number">{userStats.passengers}</div>
                </div>
                <div className="stat-card drivers">
                    <div className="stat-title">Drivers</div>
                    <div className="stat-number">{userStats.drivers}</div>
                </div>
                <div className="stat-card admins">
                    <div className="stat-title">Admins</div>
                    <div className="stat-number">{userStats.admins}</div>
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
                        <option value="all">All Users</option>
                        <option value="passenger">Passengers</option>
                        <option value="driver">Drivers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
                <button 
                    onClick={() => navigate('/users/create')}
                    className="create-user-btn"
                >
                    Create New User
                </button>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-users">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleViewUser(user)}
                                                className="view-btn"
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/users/${user._id}/edit`)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="delete-btn"
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

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Create New User</h3>
                            <button onClick={closeModals} className="modal-close">×</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    required
                                >
                                    <option value="passenger">Passenger</option>
                                    <option value="driver">Driver</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModals} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View modal removed in favor of dedicated page */}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit User</h3>
                            <button onClick={closeModals} className="modal-close">×</button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="Enter new password or leave blank"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} disabled>
                                    <option value="passenger">Passenger</option>
                                    <option value="driver">Driver</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <small className="form-hint">Role cannot be changed from Edit. Use Create New User to assign a different role.</small>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModals} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;

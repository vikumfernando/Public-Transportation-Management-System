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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

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


    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        
        try {
            const response = await axios.delete(`http://localhost:8070/users/${userToDelete._id}`);
            if (response.data.success) {
                setShowDeleteConfirm(false);
                setShowDeleteSuccess(true);
                fetchUsers();
                fetchUserStats();
                setTimeout(() => {
                    setShowDeleteSuccess(false);
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
            setShowDeleteConfirm(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const handleViewUser = (user) => {
        // Navigate to dedicated view page
        navigate(`/users/${user._id}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
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
                                                onClick={() => handleDeleteUser(user)}
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

        </div>

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
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
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '24px'
                            }}
                        >
                            ⚠️
                        </div>
                    </div>
                    <h4 className="mb-2" style={{ color: '#0B5648' }}>Confirm Delete</h4>
                    <p className="text-muted mb-3">
                        Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? 
                        This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <button 
                            onClick={cancelDelete}
                            className="btn btn-outline-secondary"
                            style={{ borderRadius: '8px' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="btn"
                            style={{ 
                                backgroundColor: '#ef4444', 
                                color: 'white', 
                                borderRadius: '8px' 
                            }}
                        >
                            Delete User
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Success Popup */}
        {showDeleteSuccess && (
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
                    <h4 className="mb-2" style={{ color: '#0B5648' }}>User Deleted Successfully!</h4>
                    <p className="text-muted mb-0">The user has been removed from the system.</p>
                </div>
            </div>
        )}

        <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideInUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        `}</style>
        </>
    );
}

export default UserManagement;

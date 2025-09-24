import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserManagement.css";

function UserManagement() {
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
    const [editingUser, setEditingUser] = useState(null);
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
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUserStats();
        fetchUsers();
    }, [selectedRole]);

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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8070/users', formData);
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
                delete updateData.password;
            }
            
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
        setEditingUser(null);
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
            {/* Your JSX remains unchanged */}
        </div>
    );
}

export default UserManagement;

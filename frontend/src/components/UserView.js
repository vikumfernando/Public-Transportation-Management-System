import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserView.css';

function UserView() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setLoading(true);
				const res = await axios.get(`http://localhost:8070/users/${id}`);
				if (res.data.success) setUser(res.data.user);
			} catch (e) {
				setError(e?.response?.data?.message || 'Failed to load user');
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [id]);

	const formatDate = (dateString) => new Date(dateString).toLocaleString();

	if (loading) return <div className="user-view-page"><div className="loading">Loading...</div></div>;
	if (error) return <div className="user-view-page"><div className="alert alert-error">{error}</div></div>;
	if (!user) return null;

	return (
		<div className="user-view-page">
			<div className="view-header">
				<button className="back-button" onClick={() => navigate('/users')}>← Back to Users</button>
				<div>
					<h1>User Details</h1>
					<p>Live profile preview and account information</p>
				</div>
			</div>

			<div className="profile-card">
				<div className="avatar">{(user.firstName?.[0]||'U')}{(user.lastName?.[0]||'N')}</div>
				<div className="info">
					<h3>{user.firstName} {user.lastName}</h3>
					<p>{user.email}</p>
					<small>{user.role?.toUpperCase()}</small>
				</div>
				<div className={`role-badge role-${user.role}`}>{user.role}</div>
			</div>

			<div className="details-grid">
				<div className="detail"><label>First Name</label><div>{user.firstName}</div></div>
				<div className="detail"><label>Last Name</label><div>{user.lastName}</div></div>
				<div className="detail"><label>Email</label><div>{user.email}</div></div>
				<div className="detail"><label>Phone</label><div>{user.phone}</div></div>
				<div className="detail"><label>Role</label><div><span className={`role-badge role-${user.role}`}>{user.role}</span></div></div>
				<div className="detail"><label>Created</label><div>{formatDate(user.createdAt)}</div></div>
			</div>

			<div className="actions">
				<button className="edit-btn" onClick={() => navigate(`/users/${id}/edit`)}>Edit</button>
			</div>
		</div>
	);
}

export default UserView; 
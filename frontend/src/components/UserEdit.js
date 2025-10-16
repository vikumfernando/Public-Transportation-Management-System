import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserEdit.css';

function UserEdit() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: '', password: '' });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await axios.get(`http://localhost:8070/users/${id}`);
				if (res.data.success) setForm({ ...res.data.user, password: '' });
			} catch (e) {
				setError(e?.response?.data?.message || 'Failed to load user');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		if (error) setError('');
	};

	const validate = () => {
		if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
			setError('Please fill in all required fields');
			return false;
		}
		const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
		if (!emailRegex.test(form.email)) { setError('Please enter a valid email'); return false; }
		const phoneRegex = /^\d{10}$/;
		if (!phoneRegex.test(form.phone)) { setError('Phone must be 10 digits'); return false; }
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;
		try {
			setSaving(true);
			const payload = { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, role: form.role };
			if (form.password) payload.password = form.password;
			const res = await axios.put(`http://localhost:8070/users/${id}`, payload);
			if (res.data.success) {
				setShowSuccessPopup(true);
				setTimeout(() => {
					setShowSuccessPopup(false);
					navigate(`/users/${id}`);
				}, 2000);
			}
		} catch (e) {
			setError(e?.response?.data?.message || 'Failed to update user');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="user-edit-page"><div className="loading">Loading...</div></div>;

	return (
		<>
		<div className="user-edit-page">
			<div className="edit-header">
				<button className="back-button" onClick={() => navigate('/users')}>← Back to Users</button>
				<div>
					<h1>Edit User</h1>
					<p>Update user details. Role cannot be changed here.</p>
				</div>
			</div>

			{error && <div className="alert alert-error">{error}</div>}
			{success && <div className="alert alert-success">{success}</div>}

			<form onSubmit={handleSubmit} className="edit-form">
				<div className="form-row">
					<div className="form-group">
						<label>First Name</label>
						<input name="firstName" value={form.firstName} onChange={handleChange} required />
					</div>
					<div className="form-group">
						<label>Last Name</label>
						<input name="lastName" value={form.lastName} onChange={handleChange} required />
					</div>
				</div>
				<div className="form-group">
					<label>Email</label>
					<input type="email" name="email" value={form.email} onChange={handleChange} required />
				</div>
				<div className="form-group">
					<label>Phone</label>
					<input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
				</div>
				<div className="form-group">
					<label>Role</label>
					<select name="role" value={form.role} onChange={handleChange}>
						<option value="passenger">Passenger</option>
						<option value="driver">Driver</option>
						<option value="admin">Admin</option>
					</select>
					<small className="form-hint">Role can be changed by admins.</small>
				</div>
				<div className="form-group">
					<label>New Password (optional)</label>
					<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
				</div>
				<div className="form-actions">
					<button type="button" className="cancel-btn" onClick={() => navigate(`/users/${id}`)} disabled={saving}>Cancel</button>
					<button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
				</div>
			</form>
		</div>

		{/* Success Popup */}
		{showSuccessPopup && (
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
					<h4 className="mb-2" style={{ color: '#0B5648' }}>User Updated Successfully!</h4>
					<p className="text-muted mb-0">Redirecting to user details...</p>
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

export default UserEdit; 
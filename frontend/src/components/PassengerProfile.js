import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PassengerProfile.css";

function PassengerProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [userId, setUserId] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            navigate("/signin");
            return;
        }
        const u = JSON.parse(stored);
        if (!u?.id) {
            navigate("/signin");
            return;
        }
        setUserId(u.id);
        fetchSelf(u.id);
    }, [navigate]);

    const fetchSelf = async (id) => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8070/users/${id}`);
            if (res.data?.success) {
                const user = res.data.user;
                setFormData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    password: "",
                    confirmPassword: ""
                });
            }
        } catch (e) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const validate = () => {
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            setError("Please fill in all required fields");
            return false;
        }
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Phone number must be exactly 10 digits");
            return false;
        }
        if (formData.password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must contain at least 8 characters including uppercase, lowercase, number, and special character");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return false;
            }
        }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSaving(true);
            setError("");
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
            };
            if (formData.password) payload.password = formData.password;
            const res = await axios.put(`http://localhost:8070/users/${userId}`, payload);
            if (res.data?.success) {
                setSuccess("Profile updated successfully");
                // Update localStorage copy
                const updatedUser = { ...JSON.parse(localStorage.getItem("user")), firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
        try {
            await axios.delete(`http://localhost:8070/users/${userId}`);
            // Clear session and redirect to sign in
            localStorage.removeItem("user");
            navigate("/signin");
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to delete account");
        }
    };

    if (loading) {
        return (
            <div className="passenger-profile-container" style={{ '--page-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
                <div className="loading-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="passenger-profile-container" style={{ '--page-bg': `url(${process.env.PUBLIC_URL}/images/background.png)` }}>
            <div className="profile-card-glass">
                <div className="header-row">
                    <h1>Your Profile</h1>
                    <div className="header-actions">
                        <button className="danger-btn" onClick={handleDelete}>Delete Account</button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error"><span className="alert-icon">!</span>{error}</div>
                )}
                {success && (
                    <div className="alert alert-success"><span className="alert-icon">✓</span>{success}</div>
                )}

                <form onSubmit={handleSave} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="10 digits" />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Change Password (optional)</h3>
                        <div className="form-row">
                            <div className="form-group password-group">
                                <label htmlFor="password">New Password</label>
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Enter new password" />
                                <button type="button" className="toggle-btn" onClick={() => setShowPassword(!showPassword)} disabled={!formData.password}>{showPassword ? 'Hide' : 'Show'}</button>
                            </div>
                            <div className="form-group password-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" disabled={!formData.password} />
                                <button type="button" className="toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={!formData.password}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PassengerProfile;



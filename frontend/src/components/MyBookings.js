import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../styles/MyBookings.css";

const MyBookings = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listResults, setListResults] = useState([]);
  const location = useLocation();
  const [successBanner, setSuccessBanner] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editPassengers, setEditPassengers] = useState([]);
  const [editContact, setEditContact] = useState({ email: '', phone: '' });
  const [activeFilter, setActiveFilter] = useState('all'); // all | upcoming | past
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc | date_asc

  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccessBanner(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-load current logged-in user's bookings
  useEffect(() => {
    const ctx = getCurrentUserContext();
    if (ctx.userId) setUserId(ctx.userId);
    fetchAllForCurrentUser(ctx);
  }, []);

  const fetchByUser = async () => {
    if (!userId.trim()) {
      // Try by email fallback
      const email = getUserEmail();
      if (!email) {
        setError('Please sign in to view your bookings');
        return;
      }
      return fetchByEmail(email);
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8070/Bookings/by-user?userId=${encodeURIComponent(userId.trim())}`
      );
      const data = await res.json();
      if (data.success) {
        const items = (data.data || []).filter(b => b.bookingStatus !== 'cancelled');
        setListResults(items);
      } else {
        setListResults([]);
        setError(data.message || 'No bookings found for this user');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch user bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchByUserWithId = async (id) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8070/Bookings/by-user?userId=${encodeURIComponent(id)}`
      );
      const data = await res.json();
      if (data.success) {
        const items = (data.data || []).filter(b => b.bookingStatus !== 'cancelled');
        setListResults(items);
      } else {
        setListResults([]);
        setError(data.message || 'No bookings found for this user');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch user bookings');
    } finally {
      setLoading(false);
    }
  };

  const getUserEmail = () => {
    try {
      const raw = (typeof window !== 'undefined') ? window.localStorage.getItem('user') : null;
      if (!raw) return '';
      const obj = JSON.parse(raw);
      return obj?.email || '';
    } catch (_) { return ''; }
  };

  const fetchByEmail = async (email) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8070/Bookings/by-user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        const items = (data.data || []).filter(b => b.bookingStatus !== 'cancelled');
        setListResults(items);
      } else {
        setListResults([]);
        setError(data.message || 'No bookings found for this email');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserContext = () => {
    try {
      const raw = (typeof window !== 'undefined') ? window.localStorage.getItem('user') : null;
      if (!raw) return { userId: '', email: '' };
      const obj = JSON.parse(raw);
      return {
        userId: obj?._id || obj?.id || '',
        email: obj?.email || ''
      };
    } catch (_) {
      return { userId: '', email: '' };
    }
  };

  const fetchAllForCurrentUser = async (ctx) => {
    const context = ctx || getCurrentUserContext();
    const tasks = [];
    if (context.userId) tasks.push(fetchByUserWithId(context.userId));
    if (context.email) tasks.push(fetchByEmail(context.email));
    if (tasks.length === 0) {
      setError('Please sign in to view your bookings');
      return;
    }

    // Run both and merge results; the individual functions manage loading state; we want a unified loading UX here
    setLoading(true);
    try {
      const [byId, byEmail] = await Promise.allSettled([
        context.userId ? fetch(`http://localhost:8070/Bookings/by-user?userId=${encodeURIComponent(context.userId)}`) : null,
        context.email ? fetch(`http://localhost:8070/Bookings/by-user?email=${encodeURIComponent(context.email)}`) : null
      ]);

      const arrays = [];
      if (byId && byId.status === 'fulfilled' && byId.value) {
        const json = await byId.value.json();
        if (json.success && Array.isArray(json.data)) arrays.push(json.data);
      }
      if (byEmail && byEmail.status === 'fulfilled' && byEmail.value) {
        const json = await byEmail.value.json();
        if (json.success && Array.isArray(json.data)) arrays.push(json.data);
      }

      const mergedMap = new Map();
      arrays.flat().forEach(b => {
        const key = b.bookingId || b._id;
        if (!mergedMap.has(key)) mergedMap.set(key, b);
      });
      const merged = Array.from(mergedMap.values())
        .filter(b => b.bookingStatus !== 'cancelled')
        .sort((a, b) => new Date(b.travelDate) - new Date(a.travelDate));

      setListResults(merged);
      if (merged.length === 0) {
        setError('No bookings found for your account');
      } else {
        setError(null);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchByUserWithFallback = async () => {
    const id = userId || (typeof window !== 'undefined' ? (() => {
      try {
        const u = JSON.parse(window.localStorage.getItem('user') || 'null');
        return u?._id || u?.id || '';
      } catch (_) { return ''; }
    })() : '');
    if (id) {
      await fetchByUserWithId(id);
    } else {
      setError('Please sign in to view your bookings');
    }
  };

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    try {
      const b = listResults.find(x => x.bookingId === bookingId);

      // First cancel (business state), then delete (hard remove)
      if (b?._id) {
        await fetch(`http://localhost:8070/Bookings/${b._id}/cancel`, { method: 'PUT' });
        const del = await fetch(`http://localhost:8070/Bookings/${b._id}`, { method: 'DELETE' });
        const dj = await del.json();
        if (!dj.success) throw new Error(dj.message || 'Delete failed');
      } else {
        // fallback by bookingId only
        await fetch('http://localhost:8070/Bookings/cancel', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        });
        const del = await fetch(`http://localhost:8070/Bookings/dummy?bookingId=${encodeURIComponent(bookingId)}`, { method: 'DELETE' });
        const dj = await del.json();
        if (!dj.success) throw new Error(dj.message || 'Delete failed');
      }

      // Remove locally for snappy UI
      setListResults(prev => prev.filter(x => x.bookingId !== bookingId));
      alert('Booking cancelled and deleted successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to cancel booking');
    }
  };

  const updateBooking = async (b) => {
    setEditingId(b._id);
    setEditPassengers((b.passengerDetails || []).map(p => ({
      name: p.name || '',
      age: p.age || '',
      gender: p.gender || 'male',
      phone: p.phone || ''
    })));
    setEditContact({
      email: b.contactInfo?.email || '',
      phone: b.contactInfo?.phone || ''
    });
  };

  const handleEditPassengerChange = (index, field, value) => {
    setEditPassengers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === 'age' ? Number(value) : value };
      return copy;
    });
  };

  const handleEditContactChange = (field, value) => {
    setEditContact(prev => ({ ...prev, [field]: value }));
  };

  const saveBookingEdits = async (b) => {
    // Validate contact email/phone formats and passenger phone before saving
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;

    if (editContact.email && !emailRegex.test(String(editContact.email).trim())) {
      alert('Please enter a valid contact email');
      return;
    }
    if (editContact.phone && !phoneRegex.test(String(editContact.phone).trim())) {
      alert('Please enter a valid contact phone number');
      return;
    }
    for (let i = 0; i < editPassengers.length; i++) {
      const p = editPassengers[i];
      if (!p.name || !p.age) {
        alert(`Please fill required fields for passenger ${i + 1}`);
        return;
      }
      if (p.age < 1 || p.age > 100) {
        alert(`Passenger ${i + 1}: please enter a valid age`);
        return;
      }
      if (p.phone && !phoneRegex.test(String(p.phone).trim())) {
        alert(`Passenger ${i + 1}: please enter a valid phone number`);
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:8070/Bookings/${b._id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerDetails: editPassengers, contactInfo: editContact })
      });
      const data = await res.json();
      if (data.success) {
        // Update the item locally
        setListResults(prev => prev.map(x => x._id === b._id ? { ...x, ...data.data } : x));
        setEditingId('');
      } else {
        alert(data.message || 'Failed to update booking');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update booking');
    }
  };

  const cancelBookingEdits = () => {
    setEditingId('');
    setEditPassengers([]);
    setEditContact({ email: '', phone: '' });
  };

  const downloadPdf = (b) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Bus Ticket Confirmation', 14, 20);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${b.bookingId}`, 14, 30);
    doc.text(`Bus: ${b.busId?.vehicleNumber || ''} (${b.busId?.vehicleType || ''})`, 14, 38);
    doc.text(`From: ${b.fromStopId?.stopName || ''}`, 14, 46);
    doc.text(`To: ${b.toStopId?.stopName || ''}`, 14, 54);
    doc.text(`Travel Date: ${new Date(b.travelDate).toDateString()}`, 14, 62);
    doc.text(`Status: ${b.bookingStatus} | Payment: ${b.paymentStatus}`, 14, 70);
    doc.text(`Total Fare: Rs. ${Number(b.totalFare).toFixed(2)}`, 14, 78);

    const seatRows = b.seatNumbers.map((s, idx) => [
      idx + 1,
      s,
      b.passengerDetails[idx]?.name || '',
      b.passengerDetails[idx]?.age || '',
      b.passengerDetails[idx]?.gender || ''
    ]);

    autoTable(doc, {
      startY: 86,
      head: [['#', 'Seat', 'Passenger', 'Age', 'Gender']],
      body: seatRows
    });
    doc.save(`ticket-${b.bookingId}.pdf`);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      confirmed: 'status-confirmed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return statusMap[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderBookingCard = (booking) => (
    <div className="booking-card" key={booking.bookingId}>
      <div className="booking-header">
        <div className="booking-id-section">
          <span className="booking-id-label">Booking ID</span>
          <span className="booking-id-value">{booking.bookingId}</span>
        </div>
        <div className={`status-badge ${getStatusClass(booking.bookingStatus)}`}>
          {booking.bookingStatus.toUpperCase()}
        </div>
      </div>

      <div className="booking-content">
        <div className="journey-section">
          <h3 className="section-title">Journey Details</h3>
          <div className="journey-info">
            <div className="route-info">
              <div className="location-item">
                <span className="location-label">From</span>
                <span className="location-value">{booking.fromStopId?.stopName}</span>
              </div>
              <div className="route-divider">→</div>
              <div className="location-item">
                <span className="location-label">To</span>
                <span className="location-value">{booking.toStopId?.stopName}</span>
              </div>
            </div>

            <div className="booking-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <div className="meta-content">
                  <span className="meta-label">Travel Date</span>
                  <span className="meta-value">{formatDate(booking.travelDate)}</span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">🚍</span>
                <div className="meta-content">
                  <span className="meta-label">Bus</span>
                  <span className="meta-value">
                    {booking.busId?.vehicleNumber} ({booking.busId?.vehicleType})
                  </span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">💺</span>
                <div className="meta-content">
                  <span className="meta-label">Seats</span>
                  <span className="meta-value">{booking.seatNumbers.join(', ')}</span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">💰</span>
                <div className="meta-content">
                  <span className="meta-label">Total Fare</span>
                  <span className="meta-value">Rs. {Number(booking.totalFare).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {editingId === booking._id ? (
          <div className="passengers-section edit-mode">
            <div className="edit-header">
              <h4 className="passengers-title">Edit Passenger Details</h4>
              <span className="edit-hint">Update details and click Save</span>
            </div>
            <div className="edit-passenger-grid">
              {editPassengers.map((p, index) => (
                <div key={index} className="edit-passenger-row">
                  <div className="field">
                    <label>Name</label>
                    <input
                      className="input"
                      type="text"
                      value={p.name}
                      onChange={(e) => handleEditPassengerChange(index, 'name', e.target.value)}
                      placeholder={`Passenger ${index + 1} name`}
                    />
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input
                      className="input"
                      type="number"
                      value={p.age}
                      onChange={(e) => handleEditPassengerChange(index, 'age', e.target.value)}
                      placeholder="Age"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select
                      className="input select"
                      value={p.gender}
                      onChange={(e) => handleEditPassengerChange(index, 'gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input
                      className="input"
                      type="tel"
                      value={p.phone}
                      onChange={(e) => handleEditPassengerChange(index, 'phone', e.target.value)}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-edit">
              <h5>Contact Info</h5>
              <div className="contact-grid">
                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    value={editContact.email}
                    onChange={(e) => handleEditContactChange('email', e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    className="input"
                    type="tel"
                    value={editContact.phone}
                    onChange={(e) => handleEditContactChange('phone', e.target.value)}
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="passengers-section">
            <h4 className="passengers-title">
              Passengers ({booking.passengerDetails.length})
            </h4>
            <div className="passengers-list">
              {booking.passengerDetails.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  <span className="passenger-name">{passenger.name}</span>
                  <span className="passenger-details">
                    {passenger.age} years, {passenger.gender}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="booking-actions">
        <button className="action-btn download-btn" onClick={() => downloadPdf(booking)}>
          <span className="btn-icon">📄</span>
          Download PDF
        </button>

        {booking.bookingStatus !== 'completed' && booking.bookingStatus !== 'cancelled' && (
          editingId === booking._id ? (
            <>
              <button className="action-btn update-btn" onClick={() => saveBookingEdits(booking)}>
                <span className="btn-icon">💾</span>
                Save
              </button>
              <button className="action-btn cancel-btn" onClick={cancelBookingEdits}>
                <span className="btn-icon">↩️</span>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="action-btn update-btn" onClick={() => updateBooking(booking)}>
                <span className="btn-icon">✏️</span>
                Update
              </button>
              <button className="action-btn cancel-btn" onClick={() => cancelBooking(booking.bookingId)}>
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            </>
          )
        )}
      </div>
    </div>
  );

  const isPast = (b) => new Date(b.travelDate) < new Date(new Date().toDateString());
  const filteredList = (listResults || [])
    .filter(b => {
      if (activeFilter === 'upcoming') return !isPast(b);
      if (activeFilter === 'past') return isPast(b);
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.travelDate).getTime();
      const db = new Date(b.travelDate).getTime();
      return sortBy === 'date_asc' ? da - db : db - da;
    });

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">🎫</div>
            <div className="header-text">
              <h1 className="page-title">My Bookings</h1>
              <p className="page-subtitle">Manage your confirmed and past bus bookings</p>
            </div>
          </div>
        </div>

        {successBanner && (
          <div className="success-banner">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span className="success-message">
                Your booking has been confirmed successfully!
              </span>
            </div>
          </div>
        )}

        <div className="controls-section">
          <div className="filters">
            <div className="filter-group">
            </div>


          </div>
          <button
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={() => fetchAllForCurrentUser()}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              <>
                <span className="btn-icon">🔄</span>
                Refresh
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="bookings-section">
          {filteredList.length > 0 ? (
            <>
              <div className="list-meta">
                Showing <strong>{filteredList.length}</strong> of <strong>{listResults.length}</strong>
              </div>
              <div className="bookings-grid">
                {filteredList.map((booking) => renderBookingCard(booking))}
              </div>
            </>
          ) : (
            !loading && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">No Bookings Found</h3>
                <p className="empty-message">
                  You haven't made any bookings yet. Start planning your next journey!
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;

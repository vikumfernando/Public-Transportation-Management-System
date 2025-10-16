import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/SeatLayout.css';

const SeatLayoutPage = () => {
    const { busId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const fromStopId = searchParams.get('fromStopId');
    const toStopId = searchParams.get('toStopId');
    const travelDate = searchParams.get('travelDate');

    const [seatLayout, setSeatLayout] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [showPassengerForm, setShowPassengerForm] = useState(false);

    useEffect(() => {
        if (busId && fromStopId && toStopId && travelDate) {
            // Check if travel date is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(travelDate);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setError('Cannot access seat layout for previous dates. Please select today or a future date.');
                setLoading(false);
                return;
            }

            fetchSeatLayout();
        } else {
            setError('Missing required parameters');
            setLoading(false);
        }
    }, [busId, fromStopId, toStopId, travelDate]);

    const fetchSeatLayout = async () => {
        try {
            console.log('Fetching seat layout with params:', { busId, travelDate, fromStopId, toStopId });

            // Skip bus test for now and go directly to seat layout
            console.log('Skipping bus test, going directly to seat layout API');

            const params = new URLSearchParams({
                travelDate,
                fromStopId,
                toStopId
            });

            const url = `http://localhost:8070/Bookings/seat-layout/${busId}?${params}`;
            console.log('Fetching from URL:', url);

            const response = await fetch(url);
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                setSeatLayout(data.data);
                // Initialize passenger details array
                setPassengerDetails([]);
            } else {
                console.error('API returned error:', data);
                setError(data.message || 'Failed to fetch seat layout');
            }
        } catch (err) {
            console.error('Error fetching seat layout:', err);
            setError('Failed to load seat layout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seat) => {
        if (seat.status === 'booked' || seat.status === 'unavailable') return;

        const seatId = seat.seatId;
        const isSelected = selectedSeats.includes(seatId);

        if (isSelected) {
            // Deselect seat
            setSelectedSeats(prev => prev.filter(id => id !== seatId));
            setPassengerDetails(prev => prev.filter((_, index) =>
                selectedSeats[index] !== seatId
            ));
        } else {
            // Select seat (max 6 seats)
            if (selectedSeats.length < 6) {
                setSelectedSeats(prev => [...prev, seatId]);
                setPassengerDetails(prev => [...prev, {
                    name: '',
                    age: '',
                    gender: 'male',
                    phone: ''
                }]);
            } else {
                alert('You can select maximum 6 seats at a time');
            }
        }
    };

    const handlePassengerDetailsChange = (index, field, value) => {
        setPassengerDetails(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleProceedToPassengerDetails = () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        setShowPassengerForm(true);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        return phoneRegex.test(phone);
    };

    const validatePassengerDetails = () => {
        for (let i = 0; i < passengerDetails.length; i++) {
            const passenger = passengerDetails[i];
            if (!passenger.name || !passenger.age) {
                alert(`Please fill all required details for passenger ${i + 1}`);
                return false;
            }
            if (passenger.age < 1 || passenger.age > 100) {
                alert(`Please enter a valid age for passenger ${i + 1}`);
                return false;
            }
            if (passenger.phone && !validatePhone(passenger.phone)) {
                alert(`Please enter a valid phone number for passenger ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    const handleBookSeats = async () => {
        if (!validatePassengerDetails()) return;

        setBookingInProgress(true);
        try {
            const totalFare = selectedSeats.length * (seatLayout?.pricing?.farePerSeat || 0);

            const bookingData = {
                busId,
                userId: (typeof window !== 'undefined') ? (() => {
                    try {
                        const raw = window.localStorage.getItem('user');
                        if (!raw) return null;
                        const u = JSON.parse(raw);
                        return u?._id || u?.id || null;
                    } catch (_) { return null; }
                })() : null,
                seatNumbers: selectedSeats,
                fromStopId,
                toStopId,
                passengerDetails,
                totalFare,
                travelDate,
                busInfo: seatLayout?.busInfo
            };

            // Navigate to Top-up page with booking data
            navigate('/topup', {
                state: {
                    bookingData: bookingData
                }
            });
        } catch (err) {
            console.error('Error preparing payment:', err);
            alert('Failed to proceed to payment. Please try again.');
        } finally {
            setBookingInProgress(false);
        }
    };

    const handleBackToBusDetails = () => {
        const params = new URLSearchParams({
            fromStopId,
            toStopId,
            travelDate
        });
        navigate(`/bus-details/${busId}?${params}`);
    };

    const getSeatStatusColor = (seat) => {
        if (selectedSeats.includes(seat.seatId)) return 'selected';
        return seat.status;
    };

    const calculateTotalFare = () => {
        return selectedSeats.length * seatLayout?.pricing?.farePerSeat || 0;
    };

    if (loading) {
        return (
            <div className="seat-layout-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading seat layout...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seat-layout-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={handleBackToBusDetails} className="back-button">
                        Back to Bus Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="seat-layout-page">
            <div className="page-header">
                <button onClick={handleBackToBusDetails} className="back-button">
                    ← Back to Bus Details
                </button>
                <h1>Select Your Seats</h1>
            </div>

            <div className="seat-layout-container">
                {!showPassengerForm ? (
                    <>
                        {/* Bus Info Header */}
                        <div className="bus-info-card">
                            <div className="bus-info">
                                <h3>{seatLayout.busInfo.vehicleNumber}</h3>
                                <span className="bus-type">{seatLayout.busInfo.vehicleType}</span>
                            </div>
                            <div className="travel-info">
                                <span>Travel Date: {new Date(travelDate).toDateString()}</span>
                            </div>
                        </div>

                        {/* Seat Legend */}
                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="legend-seat available"></div>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat selected"></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat booked"></div>
                                <span>Booked</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat unavailable"></div>
                                <span>Unavailable</span>
                            </div>
                        </div>

                        <div className="main-content">
                            {/* Seat Layout */}
                            <div className="seat-layout-section">
                                <div className="bus-layout">
                                    <div className="driver-section">
                                        <div className="steering-wheel">🚗</div>
                                        <span>Driver</span>
                                    </div>

                                    <div className="seats-container">
                                        {seatLayout.seatLayout.rows.map((row, rowIndex) => (
                                            <div key={rowIndex} className="seat-row">
                                                <span className="row-number">{row.rowNumber}</span>
                                                <div className="seats">
                                                    {row.seats.map((seat, seatIndex) => (
                                                        seat.type === 'gangway' ? (
                                                            <div key={seatIndex} className="gangway"></div>
                                                        ) : (
                                                            <button
                                                                key={seatIndex}
                                                                className={`seat ${getSeatStatusColor(seat)} ${seat.type}`}
                                                                onClick={() => handleSeatClick(seat)}
                                                                disabled={seat.status === 'booked' || seat.status === 'unavailable'}
                                                                title={`Seat ${seat.seatId} - ${seat.type}`}
                                                            >
                                                                {seat.seatId}
                                                            </button>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Summary */}
                            <div className="booking-summary">
                                <h3>Booking Summary</h3>

                                {selectedSeats.length > 0 ? (
                                    <>
                                        <div className="selected-seats">
                                            <h4>Selected Seats ({selectedSeats.length})</h4>
                                            <div className="seat-numbers">
                                                {selectedSeats.map((seatId, index) => (
                                                    <span key={index} className="seat-number">
                                                        {seatId}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="fare-breakdown">
                                            <div className="fare-item">
                                                <span>Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                                                <span>Rs. {calculateTotalFare().toFixed(2)}</span>
                                            </div>
                                            <div className="fare-total">
                                                <span>Total Amount</span>
                                                <span>Rs. {calculateTotalFare().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="proceed-button"
                                            onClick={handleProceedToPassengerDetails}
                                        >
                                            Proceed to Passenger Details
                                        </button>
                                    </>
                                ) : (
                                    <div className="no-selection">
                                        <p>Please select seats to continue</p>
                                        <div className="selection-info">
                                            <small>• Click on available seats to select</small>
                                            <small>• You can select up to 6 seats</small>
                                            <small>• Window and aisle seats available</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Passenger Details Form */
                    <div className="passenger-form">
                        <div className="form-header">
                            <h2>Passenger Details</h2>
                            <p>Please fill in the details for all passengers</p>
                        </div>

                        {/* Contact Information removed as requested */}

                        {/* Passenger Details */}
                        <div className="passengers-section">
                            <h3>Passenger Details</h3>
                            {passengerDetails.map((passenger, index) => (
                                <div key={index} className="passenger-card">
                                    <h4>Passenger {index + 1} - Seat {selectedSeats[index]}</h4>
                                    <div className="passenger-form-grid">
                                        <div className="form-group">
                                            <label>Full Name *</label>

                                            <input
                                                type="text"
                                                value={passenger.name}
                                                onChange={(e) => handlePassengerDetailsChange(index, 'name', e.target.value)}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Age *</label>
                                            <input
                                                type="number"
                                                value={passenger.age}
                                                onChange={(e) => handlePassengerDetailsChange(index, 'age', e.target.value)}
                                                placeholder="Age"
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select
                                                value={passenger.gender}
                                                onChange={(e) => handlePassengerDetailsChange(index, 'gender', e.target.value)}
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={passenger.phone}
                                                onChange={(e) => handlePassengerDetailsChange(index, 'phone', e.target.value)}
                                                placeholder="Phone number (optional)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Booking Summary */}
                        <div className="final-summary">
                            <h3>Final Booking Summary</h3>
                            <div className="summary-details">
                                <div className="summary-item">
                                    <span>Bus:</span>
                                    <span>{seatLayout.busInfo.vehicleNumber} ({seatLayout.busInfo.vehicleType})</span>
                                </div>
                                <div className="summary-item">
                                    <span>Seats:</span>
                                    <span>{selectedSeats.join(', ')}</span>
                                </div>
                                <div className="summary-item">
                                    <span>Travel Date:</span>
                                    <span>{new Date(travelDate).toDateString()}</span>
                                </div>
                                <div className="summary-item total">
                                    <span>Total Amount:</span>
                                    <span>Rs. {calculateTotalFare().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                className="back-to-seats-button"
                                onClick={() => setShowPassengerForm(false)}
                            >
                                ← Back to Seat Selection
                            </button>
                            <button
                                className="confirm-booking-button"
                                onClick={handleBookSeats}
                                disabled={bookingInProgress}
                            >
                                {bookingInProgress ? 'Creating Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatLayoutPage;
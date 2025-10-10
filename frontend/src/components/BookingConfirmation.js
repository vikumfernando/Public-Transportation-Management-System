import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BookingConfirmation.css';

const BookingConfirmation = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (bookingId) {
            fetchBookingConfirmation();
        } else {
            setError('Booking ID not provided');
            setLoading(false);
        }
    }, [bookingId]);

    const fetchBookingConfirmation = async () => {
        try {
            const response = await fetch(`http://localhost:8070/Bookings/confirmation/${bookingId}`);
            const data = await response.json();
            
            if (data.success) {
                setBookingDetails(data.data);
            } else {
                setError(data.message || 'Failed to fetch booking details');
            }
        } catch (err) {
            console.error('Error fetching booking confirmation:', err);
            setError('Failed to load booking details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = () => {
        // In a real application, this would generate and download a PDF ticket
        const ticketContent = `
BUS TICKET
==================
Booking ID: ${bookingDetails.bookingDetails.bookingId}
Bus: ${bookingDetails.bookingDetails.busId.vehicleNumber}
From: ${bookingDetails.bookingDetails.fromStopId.stopName}
To: ${bookingDetails.bookingDetails.toStopId.stopName}
Date: ${new Date(bookingDetails.bookingDetails.travelDate).toDateString()}
Seats: ${bookingDetails.bookingDetails.seatNumbers.join(', ')}
Total Fare: Rs. ${bookingDetails.bookingDetails.totalFare}
Status: ${bookingDetails.bookingDetails.bookingStatus}
        `;
        
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bus-ticket-${bookingId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleBookAnother = () => {
        navigate('/search');
    };

    if (loading) {
        return (
            <div className="booking-confirmation-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading booking confirmation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-confirmation-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/search')} className="back-button">
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    const booking = bookingDetails.bookingDetails;

    return (
        <div className="booking-confirmation-page">
            <div className="confirmation-container">
                {/* Success Header */}
                <div className="success-header">
                    <div className="success-icon">✓</div>
                    <h1>Booking Confirmed!</h1>
                    <p>Your bus ticket has been successfully booked</p>
                </div>

                {/* Booking Details Card */}
                <div className="booking-card">
                    <div className="booking-header">
                        <div className="booking-id">
                            <span className="label">Booking ID</span>
                            <span className="value">{booking.bookingId}</span>
                        </div>
                        <div className="booking-status">
                            <span className={`status-badge ${booking.bookingStatus}`}>
                                {booking.bookingStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="booking-details">
                        {/* Bus Information */}
                        <div className="detail-section">
                            <h3>Bus Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Vehicle Number</span>
                                    <span className="value">{booking.busId.vehicleNumber}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Bus Type</span>
                                    <span className="value">{booking.busId.vehicleType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Journey Information */}
                        <div className="detail-section">
                            <h3>Journey Details</h3>
                            <div className="journey-info">
                                <div className="route-display">
                                    <div className="departure">
                                        <span className="location">{booking.fromStopId.stopName}</span>
                                        <span className="date">{new Date(booking.travelDate).toDateString()}</span>
                                    </div>
                                    <div className="route-line">
                                        <span className="route-arrow">→</span>
                                    </div>
                                    <div className="arrival">
                                        <span className="location">{booking.toStopId.stopName}</span>
                                        <span className="date">{new Date(booking.travelDate).toDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seat Information */}
                        <div className="detail-section">
                            <h3>Seat Information</h3>
                            <div className="seats-display">
                                <div className="seats-list">
                                    {booking.seatNumbers.map((seat, index) => (
                                        <span key={index} className="seat-badge">
                                            {seat}
                                        </span>
                                    ))}
                                </div>
                                <div className="seat-count">
                                    Total: {booking.seatNumbers.length} seat{booking.seatNumbers.length > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Passenger Information */}
                        <div className="detail-section">
                            <h3>Passenger Details</h3>
                            <div className="passengers-list">
                                {booking.passengerDetails.map((passenger, index) => (
                                    <div key={index} className="passenger-info">
                                        <div className="passenger-header">
                                            <span className="passenger-name">{passenger.name}</span>
                                            <span className="seat-assigned">Seat {booking.seatNumbers[index]}</span>
                                        </div>
                                        <div className="passenger-details">
                                            <span>Age: {passenger.age}</span>
                                            <span>Gender: {passenger.gender}</span>
                                            {passenger.phone && <span>Phone: {passenger.phone}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="detail-section">
                            <h3>Payment Details</h3>
                            <div className="payment-info">
                                <div className="payment-item">
                                    <span className="label">Total Fare</span>
                                    <span className="value fare">Rs. {booking.totalFare.toFixed(2)}</span>
                                </div>
                                <div className="payment-item">
                                    <span className="label">Payment Status</span>
                                    <span className={`value payment-status ${booking.paymentStatus}`}>
                                        {booking.paymentStatus.toUpperCase()}
                                    </span>
                                </div>
                                <div className="payment-item">
                                    <span className="label">Booking Date</span>
                                    <span className="value">
                                        {new Date(booking.bookingDate).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="qr-section">
                        <h3>E-Ticket QR Code</h3>
                        <div className="qr-code-container">
                            <div className="qr-placeholder">
                                <div className="qr-pattern"></div>
                                <p>{bookingDetails.qrCode}</p>
                            </div>
                            <div className="qr-instructions">
                                <p>Show this QR code to the conductor for verification</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Instructions */}
                <div className="instructions-card">
                    <h3>Important Instructions</h3>
                    <ul className="instructions-list">
                        {bookingDetails.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                        ))}
                        <li>Keep this booking confirmation for your records</li>
                        <li>Contact customer service for any changes or cancellations</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button 
                        className="download-button"
                        onClick={handleDownloadTicket}
                    >
                        📄 Download Ticket
                    </button>
                    <button 
                        className="print-button"
                        onClick={handlePrintTicket}
                    >
                        🖨️ Print Ticket
                    </button>
                    <button 
                        className="book-another-button"
                        onClick={handleBookAnother}
                    >
                        🎫 Book Another Ticket
                    </button>
                </div>

                {/* Contact Information */}
                <div className="contact-info">
                    <h4>Need Help?</h4>
                    <p>Contact our customer service:</p>
                    <div className="contact-details">
                        <span>📞 +94 11 123 4567</span>
                        <span>✉️ support@busbook.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
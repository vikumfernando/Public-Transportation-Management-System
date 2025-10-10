import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/BusDetails.css';

const BusDetailsPage = () => {
    const { busId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const fromStopId = searchParams.get('fromStopId');
    const toStopId = searchParams.get('toStopId');
    const travelDate = searchParams.get('travelDate');
    
    const [busDetails, setBusDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (busId && fromStopId && toStopId && travelDate) {
            fetchBusDetails();
        } else {
            setError('Missing required parameters');
            setLoading(false);
        }
    }, [busId, fromStopId, toStopId, travelDate]);

    const fetchBusDetails = async () => {
        try {
            const params = new URLSearchParams({
                fromStopId,
                toStopId,
                travelDate
            });
            
            const response = await fetch(`http://localhost:8070/BusDetails/${busId}?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setBusDetails(data.data);
            } else {
                setError(data.message || 'Failed to fetch bus details');
            }
        } catch (err) {
            console.error('Error fetching bus details:', err);
            setError('Failed to load bus details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToBooking = () => {
        const params = new URLSearchParams({
            fromStopId,
            toStopId,
            travelDate
        });
        navigate(`/booking/seat-layout/${busId}?${params}`);
    };

    const handleBackToSearch = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="bus-details-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading bus details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bus-details-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={handleBackToSearch} className="back-button">
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bus-details-page">
            <div className="page-header">
                <button onClick={handleBackToSearch} className="back-button">
                    ← Back to Search
                </button>
                <h1>Bus Details</h1>
            </div>

            <div className="bus-details-container">
                {/* Bus Info Header */}
                <div className="bus-info-header">
                    <div className="bus-main-info">
                        <div className="bus-title">
                            <h2>{busDetails.vehicleNumber}</h2>
                            <span className="bus-type-badge">{busDetails.vehicleType}</span>
                        </div>
                        
                        <div className="route-summary">
                            <div className="route-points">
                                <div className="departure-info">
                                    <span className="time">{busDetails.travelInfo.fromStop.departureTime}</span>
                                    <span className="location">{busDetails.travelInfo.fromStop.stopName}</span>
                                </div>
                                
                                <div className="route-visual">
                                    <div className="duration">{busDetails.travelInfo.estimatedDuration}</div>
                                    <div className="route-line">
                                        <span className="route-dot start"></span>
                                        <span className="route-path"></span>
                                        <span className="route-dot end"></span>
                                    </div>
                                </div>
                                
                                <div className="arrival-info">
                                    <span className="time">{busDetails.travelInfo.toStop.arrivalTime}</span>
                                    <span className="location">{busDetails.travelInfo.toStop.stopName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="booking-summary">
                        <div className="fare-display">
                            <span className="fare-label">Fare per seat</span>
                            <span className="fare-amount">Rs. {busDetails.fare.toFixed(2)}</span>
                        </div>
                        
                        <div className="seats-available">
                            <span className="seats-count">{busDetails.availableSeats}</span>
                            <span className="seats-label">seats available</span>
                        </div>
                        
                        <button 
                            className="proceed-button"
                            onClick={handleProceedToBooking}
                            disabled={busDetails.availableSeats === 0}
                        >
                            {busDetails.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="details-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Bus Details
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'route' ? 'active' : ''}`}
                        onClick={() => setActiveTab('route')}
                    >
                        Route & Stops
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('policies')}
                    >
                        Policies
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'details' && (
                        <div className="details-content">
                            <div className="details-grid">
                                <div className="detail-card">
                                    <h3>Bus Information</h3>
                                    <div className="detail-items">
                                        <div className="detail-item">
                                            <span className="label">Vehicle Number:</span>
                                            <span className="value">{busDetails.vehicleNumber}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Bus Type:</span>
                                            <span className="value">{busDetails.vehicleType}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Total Seats:</span>
                                            <span className="value">{busDetails.totalSeats}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Available Seats:</span>
                                            <span className="value">{busDetails.availableSeats}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Status:</span>
                                            <span className="value status">{busDetails.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <h3>Amenities</h3>
                                    <div className="amenities-list">
                                        {busDetails.amenities.map((amenity, index) => (
                                            <div key={index} className="amenity-item">
                                                <span className="amenity-icon">✓</span>
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <h3>Travel Information</h3>
                                    <div className="detail-items">
                                        <div className="detail-item">
                                            <span className="label">Travel Date:</span>
                                            <span className="value">{new Date(busDetails.travelInfo.travelDate).toDateString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Estimated Duration:</span>
                                            <span className="value">{busDetails.travelInfo.estimatedDuration}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Departure:</span>
                                            <span className="value">
                                                {busDetails.travelInfo.fromStop.departureTime} from {busDetails.travelInfo.fromStop.stopName}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Arrival:</span>
                                            <span className="value">
                                                {busDetails.travelInfo.toStop.arrivalTime} at {busDetails.travelInfo.toStop.stopName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'route' && (
                        <div className="route-content">
                            <div className="route-header">
                                <h3>Complete Route Information</h3>
                                <p>All stops on this route with timings</p>
                            </div>
                            
                            <div className="stops-list">
                                {busDetails.travelInfo.intermediateStops.map((stop, index) => (
                                    <div key={index} className="stop-item">
                                        <div className="stop-number">{index + 1}</div>
                                        <div className="stop-details">
                                            <div className="stop-name">{stop.stopName}</div>
                                            <div className="stop-times">
                                                {stop.arrivalTime && (
                                                    <span className="arrival-time">Arr: {stop.arrivalTime}</span>
                                                )}
                                                {stop.departureTime && (
                                                    <span className="departure-time">Dep: {stop.departureTime}</span>
                                                )}
                                            </div>
                                            {stop.distance && (
                                                <div className="stop-distance">{stop.distance} km</div>
                                            )}
                                        </div>
                                        <div className="stop-status">
                                            {index === 0 && <span className="origin">Origin</span>}
                                            {index === busDetails.travelInfo.intermediateStops.length - 1 && <span className="destination">Destination</span>}
                                            {index !== 0 && index !== busDetails.travelInfo.intermediateStops.length - 1 && <span className="intermediate">Stop</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'policies' && (
                        <div className="policies-content">
                            <div className="policy-sections">
                                <div className="policy-card">
                                    <h3>Cancellation Policy</h3>
                                    <p>{busDetails.policies.cancellation}</p>
                                </div>
                                
                                <div className="policy-card">
                                    <h3>Refund Policy</h3>
                                    <p>{busDetails.policies.refund}</p>
                                </div>
                                
                                <div className="policy-card">
                                    <h3>Boarding Instructions</h3>
                                    <p>{busDetails.policies.boardingPoint}</p>
                                </div>

                                <div className="policy-card">
                                    <h3>Important Notes</h3>
                                    <ul>
                                        <li>Please carry a valid ID proof for verification</li>
                                        <li>Children above 5 years need a separate ticket</li>
                                        <li>Smoking and alcohol consumption is prohibited</li>
                                        <li>Keep your ticket safe for the entire journey</li>
                                        <li>Report to customer service for any issues</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Actions */}
                <div className="booking-actions">
                    <div className="booking-info">
                        <div className="price-breakdown">
                            <span>Base Fare: Rs. {busDetails.fare.toFixed(2)}</span>
                            <small>*Final price may vary based on seat selection</small>
                        </div>
                    </div>
                    <button 
                        className="proceed-button-large"
                        onClick={handleProceedToBooking}
                        disabled={busDetails.availableSeats === 0}
                    >
                        {busDetails.availableSeats === 0 ? 'Bus Full - No Seats Available' : 'Proceed to Seat Selection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusDetailsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fromStopId: '',
        toStopId: '',
        travelDate: ''
    });
    const [busStops, setBusStops] = useState([]);
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Fetch bus stops on component mount
    useEffect(() => {
        fetchBusStops();
    }, []);

    const fetchBusStops = async () => {
        try {
            const response = await fetch('http://localhost:8070/BusSearch/bus-stops');
            const data = await response.json();
            if (data.success) {
                setBusStops(data.data);
            }
        } catch (error) {
            console.error('Error fetching bus stops:', error);
        }
    };

    const fetchStopSuggestions = async (q, setSuggestions) => {
        try {
            if (!q || q.length < 1) {
                setSuggestions([]);
                return;
            }
            const response = await fetch(`http://localhost:8070/BusSearch/bus-stops?search=${encodeURIComponent(q)}`);
            const data = await response.json();
            if (data.success) {
                const unique = [];
                const seen = new Set();
                for (const s of data.data) {
                    if (!seen.has(s.stopName)) {
                        unique.push(s);
                        seen.add(s.stopName);
                    }
                    if (unique.length >= 10) break;
                }
                setSuggestions(unique);
            }
        } catch (error) {
            console.error('Error fetching stop suggestions:', error);
        }
    };

    const handlePickFrom = (stop) => {
        setFromQuery(stop.stopName);
        setFormData(prev => ({ ...prev, fromStopId: stop._id }));
        setFromSuggestions([]);
    };

    const handlePickTo = (stop) => {
        setToQuery(stop.stopName);
        setFormData(prev => ({ ...prev, toStopId: stop._id }));
        setToSuggestions([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!formData.fromStopId || !formData.toStopId || !formData.travelDate) {
            alert('Please fill all required fields');
            return;
        }

        // Check if travel date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(formData.travelDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Cannot search for buses on previous dates. Please select today or a future date.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8070/BusSearch/buses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                const found = (data.data && data.data.buses) ? data.data.buses : [];
                setBuses(found);
                setSearchPerformed(true);
            } else {
                alert(data.message || 'Error searching buses');
            }
        } catch (error) {
            console.error('Error searching buses:', error);
            alert('Error searching buses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBusSelect = (bus) => {
        const params = new URLSearchParams({
            fromStopId: formData.fromStopId,
            toStopId: formData.toStopId,
            travelDate: formData.travelDate
        });
        navigate(`/booking/seat-layout/${bus.busId}?${params}`);
    };

    const handleViewDetails = (bus) => {
        const params = new URLSearchParams({
            fromStopId: formData.fromStopId,
            toStopId: formData.toStopId,
            travelDate: formData.travelDate
        });
        navigate(`/bus-details/${bus.busId}?${params}`);
    };

    const swapStops = () => {
        setFormData(prev => ({
            ...prev,
            fromStopId: prev.toStopId,
            toStopId: prev.fromStopId
        }));
    };

    return (
        <div className="search-page">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 >Online Seat Reservation</h1>
                    <p>Book your bus tickets easily and travel comfortably</p>
                </div>
            </div>

            <div className="search-container8">
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="form-row">
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>FROM</label>
                            <input
                                type="text"
                                placeholder="Type departure stop"
                                value={fromQuery}
                                onChange={(e) => {
                                    const q = e.target.value;
                                    setFromQuery(q);
                                    fetchStopSuggestions(q, setFromSuggestions);
                                }}
                                onBlur={() => setTimeout(() => setFromSuggestions([]), 150)}
                                required
                            />
                            {fromQuery && fromSuggestions.length > 0 && (
                                <div className="suggestions">
                                    {fromSuggestions.map(stop => (
                                        <div key={stop._id} className="suggestion-item" onMouseDown={() => handlePickFrom(stop)}>
                                            {stop.stopName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="swap-button-container">
                            <button
                                type="button"
                                className="swap-button"
                                onClick={swapStops}
                                title="Swap locations"
                            >
                                ⇄
                            </button>
                        </div>

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>TO</label>
                            <input
                                type="text"
                                placeholder="Type destination stop"
                                value={toQuery}
                                onChange={(e) => {
                                    const q = e.target.value;
                                    setToQuery(q);
                                    fetchStopSuggestions(q, setToSuggestions);
                                }}
                                onBlur={() => setTimeout(() => setToSuggestions([]), 150)}
                                required
                            />
                            {toQuery && toSuggestions.length > 0 && (
                                <div className="suggestions">
                                    {toSuggestions.map(stop => (
                                        <div key={stop._id} className="suggestion-item" onMouseDown={() => handlePickTo(stop)}>
                                            {stop.stopName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>TRAVEL DATE</label>
                            <input
                                type="date"
                                name="travelDate"
                                value={formData.travelDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <button
                                type="submit"
                                className="search-button"
                                disabled={loading}
                            >
                                {loading ? 'SEARCHING...' : 'SEARCH BUSES'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Search Results */}
                {searchPerformed && (
                    <div className="search-results">
                        <div className="results-header">
                            <h2>Available Buses</h2>
                            <p>{buses.length} buses found</p>
                        </div>

                        {buses.length === 0 ? (
                            <div className="no-buses">
                                <p>No buses found for the selected route and date.</p>
                                <p>Try different dates or routes.</p>
                            </div>
                        ) : (
                            <div className="buses-list">
                                {buses.map((bus, index) => (
                                    <div key={index} className="bus-card">
                                        <div className="bus-info">
                                            <div className="bus-header">
                                                <h3>{bus.vehicleNumber}</h3>
                                                <span className="bus-type">{bus.vehicleType}</span>
                                            </div>

                                            <div className="bus-route">
                                                <div className="route-info">
                                                    <div className="departure">
                                                        <span className="time">{bus.route.departureTime}</span>
                                                        <span className="location">{bus.route.fromStop.stopName}</span>
                                                    </div>
                                                    <div className="route-line">
                                                        <div className="duration">8h 0m</div>
                                                        <div className="line"></div>
                                                    </div>
                                                    <div className="arrival">
                                                        <span className="time">{bus.route.arrivalTime}</span>
                                                        <span className="location">{bus.route.toStop.stopName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bus-details">
                                            <div className="seats-info">
                                                <span className="available-seats">
                                                    {bus.availableSeats} seats available
                                                </span>
                                                <span className="total-seats">
                                                    out of {bus.totalSeats}
                                                </span>
                                            </div>

                                            <div className="fare-info">
                                                <span className="fare">Rs. {bus.fare.toFixed(2)}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="select-button"
                                                    onClick={() => handleViewDetails(bus)}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className="select-button"
                                                    onClick={() => handleBusSelect(bus)}
                                                    disabled={bus.availableSeats === 0}
                                                >
                                                    {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;

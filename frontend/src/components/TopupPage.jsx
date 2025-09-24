import { useState, useEffect } from 'react';
import { api } from '../services/api';

function TopupPage() {
  const [selectedCard, setSelectedCard] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [distance, setDistance] = useState(0);
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nfcCards, setNfcCards] = useState([]);
  const [routesInitialized, setRoutesInitialized] = useState(false);

  useEffect(() => {
    loadNfcCards();
  }, []);

  const loadNfcCards = async () => {
    try {
      const testUserId = "507f1f77bcf86cd799439011";
      const cards = await api.getSmartCards(testUserId);
      setNfcCards(cards);
    } catch (error) {
      console.error('Error loading NFC cards:', error);
    }
  };

  const lookupRoute = async () => {
    if (!routeNumber) {
      setMessage('❌ Please enter a route number');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const route = await api.getRouteByNumber(routeNumber);
      
      if (route.error) {
        setMessage(`❌ Route not found: ${route.error}`);
        setRouteData(null);
        setDistance(0);
        setFare(0);
      } else {
        setRouteData(route);
        setDistance(route.distance);
        setMessage(`✅ Route found: ${route.routeName} (${route.distance} km, ${route.duration})`);
      }
    } catch (error) {
      setMessage('❌ Error looking up route: ' + error.message);
      setRouteData(null);
      setDistance(0);
      setFare(0);
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleRoutes = async () => {
    try {
      setLoading(true);
      const result = await api.initSampleRoutes();
      setMessage(`✅ ${result.message} (${result.count} routes)`);
      setRoutesInitialized(true);
    } catch (error) {
      setMessage('❌ Error initializing routes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = () => {
    if (distance > 0) {
      // Distance-based fare calculation
      let calculatedFare = 0;
      
      if (distance <= 5) {
        calculatedFare = 100; // Rs. 100 for first 5km
      } else if (distance <= 10) {
        calculatedFare = 100 + (distance - 5) * 20; // Rs. 20 per km after 5km
      } else if (distance <= 20) {
        calculatedFare = 100 + 100 + (distance - 10) * 12.5; // Rs. 12.5 per km after 10km
      } else {
        calculatedFare = 100 + 100 + 125 + (distance - 20) * 12; // Rs. 12 per km after 20km
      }
      
      setFare(Math.round(calculatedFare));
    }
  };

  const handleDistanceChange = (e) => {
    const newDistance = parseFloat(e.target.value) || 0;
    setDistance(newDistance);
  };

  useEffect(() => {
    calculateFare();
  }, [distance]);

  const handleTransportPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!selectedCard || !routeData || fare <= 0) {
        setMessage('❌ Please select a card, lookup a route, and ensure fare is calculated');
        return;
      }

      // Check if card has sufficient balance
      const card = nfcCards.find(c => c.cardNumber === selectedCard);
      if (!card) {
        setMessage('❌ NFC card not found');
        return;
      }

      if (card.balance < fare) {
        setMessage(`❌ Insufficient balance. Required: Rs. ${fare.toFixed(2)}, Available: Rs. ${card.balance.toFixed(2)}`);
        return;
      }

      // Process transport payment
      const result = await api.updateCardBalance(selectedCard, -fare);
      
      if (result.success) {
        // Create transaction record
        try {
          await api.addTransaction({
            cardNumber: selectedCard,
            amount: fare,
            transactionType: 'transport_payment',
            status: 'completed',
            paymentMethod: 'nfc_card',
            fromLocation: routeData.routeName,
            toLocation: `Route ${routeData.routeNum}`,
            distance: distance
          });
          console.log('✅ Transaction recorded successfully');
        } catch (transactionError) {
          console.error('❌ Failed to record transaction:', transactionError);
          // Don't fail the payment if transaction recording fails
        }

        setMessage(`✅ Transport payment successful! Fare: Rs. ${fare.toFixed(2)}, New balance: Rs. ${result.balance.toFixed(2)}`);
        
        // Reset form
        setSelectedCard('');
        setRouteNumber('');
        setRouteData(null);
        setDistance(0);
        setFare(0);
        
        // Reload cards
        loadNfcCards();
      } else {
        setMessage('❌ Payment failed: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Hero Section */}
      <div style={{position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)', padding: '4rem 0'}}>
        {/* Dark overlay pattern */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          opacity: '0.6'
        }}></div>
        
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: '1'}}>
          <div style={{textAlign: 'center'}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
              Transport Payment
            </h1>
            <p style={{fontSize: '1.125rem', marginBottom: '2rem', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'}}>
              Pay for your journey with distance-based fare calculation
            </p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{fontSize: '1.5rem'}}>💰</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{fontSize: '1.5rem'}}>📱</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{fontSize: '1.5rem'}}>🚌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', paddingBottom: '2rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem'}}>
        {/* Payment Form */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937'}}>🚌 Pay for Transport</h2>
            {!routesInitialized && (
              <button
                onClick={initializeSampleRoutes}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  opacity: loading ? '0.6' : '1'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? 'Loading...' : 'Init Routes'}
              </button>
            )}
          </div>
          
          <form onSubmit={handleTransportPayment} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                Select NFC Card
              </label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                required
              >
                <option value="">Choose NFC card</option>
                {nfcCards.map((card) => (
                  <option key={card._id} value={card.cardNumber}>
                    Card #{card.cardNumber} - Rs. {card.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                Route Number
              </label>
              <div style={{display: 'flex', gap: '0.75rem'}}>
                <input
                  type="number"
                  value={routeNumber}
                  onChange={(e) => setRouteNumber(e.target.value)}
                  style={{
                    flex: '1',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white'
                  }}
                  placeholder="Enter route number (e.g., 100)"
                  min="1"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={lookupRoute}
                  disabled={loading || !routeNumber}
                  style={{
                    background: loading || !routeNumber ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading || !routeNumber ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    if (!loading && routeNumber) {
                      e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && routeNumber) {
                      e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? '🔍 Looking...' : '🔍 Lookup'}
                </button>
              </div>
            </div>

            {routeData && (
              <div style={{
                padding: '1.25rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>📍 Route Information</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
                  <div>
                    <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Route Name:</span>
                    <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0'}}>{routeData.routeName}</p>
                  </div>
                  <div>
                    <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Distance:</span>
                    <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0'}}>{routeData.distance} km</p>
                  </div>
                  <div>
                    <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Duration:</span>
                    <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0'}}>{routeData.duration}</p>
                  </div>
                  <div>
                    <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Route Number:</span>
                    <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0'}}>{routeData.routeNum}</p>
                  </div>
                </div>
              </div>
            )}

            {fare > 0 && routeData && (
              <div style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '1px solid #047857',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                  <span style={{fontSize: '1.125rem', fontWeight: '700', color: '#ffffff'}}>💰 Calculated Fare:</span>
                  <span style={{fontSize: '1.75rem', fontWeight: '800', color: '#ffffff'}}>Rs. {fare.toFixed(2)}</span>
                </div>
                <div style={{fontSize: '0.875rem', color: '#d1fae5', fontWeight: '500'}}>
                  🚌 Route: {routeData.routeName} | 📏 Distance: {distance} km | ⏱️ Duration: {routeData.duration}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || fare <= 0}
              style={{
                width: '100%',
                background: loading || fare <= 0 ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading || fare <= 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading || fare <= 0 ? 'none' : '0 6px 20px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}
              onMouseOver={(e) => {
                if (!loading && fare > 0) {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && fare > 0) {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Processing Payment...' : `💳 Pay Rs. ${fare.toFixed(2)}`}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              background: message.includes('✅') ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              boxShadow: message.includes('✅') ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
              border: message.includes('✅') ? '1px solid #047857' : '1px solid #b91c1c'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Fare Information */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}>
          <h2 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937'}}>💰 Fare Structure</h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #bbf7d0',
              borderLeft: '4px solid #10b981',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#bbf7d0';
            }}>
              <h3 style={{fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.25rem 0'}}>🚌 First 5 km</h3>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>Rs. 100.00 (Base fare)</p>
            </div>
            
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #fbbf24',
              borderLeft: '4px solid #f59e0b',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.2)';
              e.currentTarget.style.borderColor = '#f59e0b';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#fbbf24';
            }}>
              <h3 style={{fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.25rem 0'}}>🚌 5-10 km</h3>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>Rs. 20.00 per km</p>
            </div>
            
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '1px solid #93c5fd',
              borderLeft: '4px solid #3b82f6',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}>
              <h3 style={{fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.25rem 0'}}>🚌 10-20 km</h3>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>Rs. 12.50 per km</p>
            </div>
            
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
              border: '1px solid #c4b5fd',
              borderLeft: '4px solid #8b5cf6',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.2)';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#c4b5fd';
            }}>
              <h3 style={{fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.25rem 0'}}>🚌 20+ km</h3>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>Rs. 12.00 per km</p>
            </div>
          </div>


          <div style={{marginTop: '1rem', padding: '1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #fbbf24'}}>
            <h3 style={{fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937'}}>Example Calculations:</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>• 3 km = Rs. 100.00</p>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>• 8 km = Rs. 160.00</p>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>• 15 km = Rs. 212.50</p>
              <p style={{fontSize: '0.875rem', color: '#374151', margin: '0', fontWeight: '600'}}>• 25 km = Rs. 312.50</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default TopupPage;

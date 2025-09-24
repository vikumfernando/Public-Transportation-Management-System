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
    <div className="min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-8xl">🚌</div>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{color: '#0B5648'}}>
              Transport Payment
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              Pay for your journey with distance-based fare calculation
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">🚌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{color: '#0B5648'}}>🚌 Pay for Transport</h2>
            {!routesInitialized && (
              <button
                onClick={initializeSampleRoutes}
                disabled={loading}
                className="px-3 py-1 text-white text-sm rounded-md disabled:bg-gray-400"
                style={{backgroundColor: '#8CDB66'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0B5648'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8CDB66'}
              >
                {loading ? 'Loading...' : 'Init Routes'}
              </button>
            )}
          </div>
          
          <form onSubmit={handleTransportPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Select NFC Card
              </label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
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
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Route Number
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={routeNumber}
                  onChange={(e) => setRouteNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                  style={{borderColor: '#8CDB66'}}
                  placeholder="Enter route number (e.g., 100)"
                  min="1"
                />
                <button
                  type="button"
                  onClick={lookupRoute}
                  disabled={loading || !routeNumber}
                  className="px-4 py-2 text-white rounded-md disabled:bg-gray-400 transform hover:scale-110 transition-all duration-300"
                  style={{backgroundColor: '#0B5648'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
                >
                  {loading ? '🔍 Looking...' : '🔍 Lookup'}
                </button>
              </div>
            </div>

            {routeData && (
              <div className="p-4 rounded-md transform hover:scale-105 transition-all duration-300 animate-pulse" style={{backgroundColor: '#F0EBE8'}}>
                <h3 className="font-medium mb-2" style={{color: '#0B5648'}}>📍 Route Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium" style={{color: '#0B5648'}}>Route Name:</span>
                    <p style={{color: '#0B5648'}}>{routeData.routeName}</p>
                  </div>
                  <div>
                    <span className="font-medium" style={{color: '#0B5648'}}>Distance:</span>
                    <p style={{color: '#0B5648'}}>{routeData.distance} km</p>
                  </div>
                  <div>
                    <span className="font-medium" style={{color: '#0B5648'}}>Duration:</span>
                    <p style={{color: '#0B5648'}}>{routeData.duration}</p>
                  </div>
                  <div>
                    <span className="font-medium" style={{color: '#0B5648'}}>Route Number:</span>
                    <p style={{color: '#0B5648'}}>{routeData.routeNum}</p>
                  </div>
                </div>
              </div>
            )}

            {fare > 0 && routeData && (
              <div className="p-4 rounded-md transform hover:scale-105 transition-all duration-300" style={{backgroundColor: '#8CDB66'}}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium" style={{color: '#FFFFFF'}}>💰 Calculated Fare:</span>
                  <span className="text-2xl font-bold" style={{color: '#FFFFFF'}}>Rs. {fare.toFixed(2)}</span>
                </div>
                <div className="text-sm mt-1" style={{color: '#FFFFFF'}}>
                  🚌 Route: {routeData.routeName} | 📏 Distance: {distance} km | ⏱️ Duration: {routeData.duration}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || fare <= 0}
              className="w-full text-white py-3 px-4 rounded-md disabled:bg-gray-400 transform hover:scale-105 transition-all duration-300 hover:shadow-xl font-semibold"
              style={{backgroundColor: '#0B5648'}}
              onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
            >
              {loading ? '⏳ Processing Payment...' : `💳 Pay Rs. ${fare.toFixed(2)}`}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-md text-sm" style={{
              backgroundColor: message.includes('✅') ? '#8CDB66' : '#FF6B6B',
              color: '#FFFFFF'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Fare Information */}
        <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>💰 Fare Structure</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 pl-4 transform hover:scale-105 transition-all duration-300" style={{borderColor: '#8CDB66'}}>
              <h3 className="font-medium" style={{color: '#0B5648'}}>🚌 First 5 km</h3>
              <p className="text-sm" style={{color: '#0B5648'}}>Rs. 100.00 (Base fare)</p>
            </div>
            
            <div className="border-l-4 pl-4 transform hover:scale-105 transition-all duration-300" style={{borderColor: '#0B5648'}}>
              <h3 className="font-medium" style={{color: '#0B5648'}}>🚌 5-10 km</h3>
              <p className="text-sm" style={{color: '#0B5648'}}>Rs. 20.00 per km</p>
            </div>
            
            <div className="border-l-4 pl-4 transform hover:scale-105 transition-all duration-300" style={{borderColor: '#8CDB66'}}>
              <h3 className="font-medium" style={{color: '#0B5648'}}>🚌 10-20 km</h3>
              <p className="text-sm" style={{color: '#0B5648'}}>Rs. 12.50 per km</p>
            </div>
            
            <div className="border-l-4 pl-4 transform hover:scale-105 transition-all duration-300" style={{borderColor: '#0B5648'}}>
              <h3 className="font-medium" style={{color: '#0B5648'}}>🚌 20+ km</h3>
              <p className="text-sm" style={{color: '#0B5648'}}>Rs. 12.00 per km</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-md" style={{backgroundColor: '#F0EBE8'}}>
            <h3 className="font-medium mb-2" style={{color: '#0B5648'}}>Available Routes:</h3>
            <div className="text-sm space-y-1" style={{color: '#0B5648'}}>
              <p>• Route 100: Colombo to Kandy (120 km)</p>
              <p>• Route 101: Colombo to Galle (115 km)</p>
              <p>• Route 102: Colombo to Negombo (35 km)</p>
              <p>• Route 103: Colombo to Anuradhapura (200 km)</p>
              <p>• Route 104: Colombo to Jaffna (400 km)</p>
              <p>• Route 105: Colombo to Trincomalee (260 km)</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-md" style={{backgroundColor: '#F0EBE8'}}>
            <h3 className="font-medium mb-2" style={{color: '#0B5648'}}>Example Calculations:</h3>
            <div className="text-sm space-y-1" style={{color: '#0B5648'}}>
              <p>• 3 km = Rs. 100.00</p>
              <p>• 8 km = Rs. 160.00</p>
              <p>• 15 km = Rs. 212.50</p>
              <p>• 25 km = Rs. 312.50</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default TopupPage;

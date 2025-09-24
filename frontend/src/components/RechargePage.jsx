import { useState, useEffect } from 'react';
import { api } from '../services/api';

function RechargePage() {
  const [visaCards, setVisaCards] = useState([]);
  const [nfcCards, setNfcCards] = useState([]);
  const [selectedVisaCard, setSelectedVisaCard] = useState('');
  const [selectedNfcCard, setSelectedNfcCard] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      
      // Load both Visa and NFC cards
      const [visaCardsData, nfcCardsData] = await Promise.all([
        api.getVisaCards(testUserId),
        api.getSmartCards(testUserId)
      ]);
      
      setVisaCards(visaCardsData);
      setNfcCards(nfcCardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
      setMessage('❌ Error loading cards: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    
    if (!selectedVisaCard || !selectedNfcCard || !amount) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage('❌ Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Check if Visa card has sufficient balance
      const visaCard = visaCards.find(card => card.cardNumber === selectedVisaCard);
      if (!visaCard) {
        setMessage('❌ Visa card not found');
        return;
      }

      if (visaCard.balance < parseFloat(amount)) {
        setMessage(`❌ Insufficient balance. Available: Rs. ${visaCard.balance.toFixed(2)}`);
        return;
      }

      // Simulate payment processing
      setMessage('🔄 Processing payment...');
      
      // Wait a moment to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update Visa card balance (deduct amount)
      const visaResult = await api.updateCardBalance(selectedVisaCard, -parseFloat(amount));
      if (!visaResult.success) {
        throw new Error(visaResult.error || 'Failed to update Visa card');
      }
      
      // Update NFC card balance (add amount)
      const nfcResult = await api.updateCardBalance(selectedNfcCard, parseFloat(amount));
      if (!nfcResult.success) {
        throw new Error(nfcResult.error || 'Failed to update NFC card');
      }

      // Create transaction record
      await api.addTransaction({
        cardNumber: selectedNfcCard,
        amount: parseFloat(amount),
        transactionType: 'recharge',
        status: 'completed',
        paymentMethod: 'visa_card',
        sourceCard: selectedVisaCard
      });

      setMessage(`✅ Recharge successful! NFC card balance: Rs. ${nfcResult.balance.toFixed(2)}`);
      
      // Reset form
      setSelectedVisaCard('');
      setSelectedNfcCard('');
      setAmount('');
      
      // Reload cards to show updated balances
      loadCards();

    } catch (error) {
      console.error('Recharge error:', error);
      setMessage('❌ Recharge failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && visaCards.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#0B5648'}}></div>
          <div className="text-xl" style={{color: '#0B5648'}}>Loading cards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-8xl">💳</div>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{color: '#0B5648'}}>
              Recharge NFC Card
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              Transfer funds from Visa card to NFC card
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💳</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">➡️</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#0B5648'}}>💳 Recharge Your NFC Card</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recharge Form */}
        <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>Recharge with Visa Card</h2>
          
          <form onSubmit={handleRecharge} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Select Visa Card (Source)
              </label>
              <select
                value={selectedVisaCard}
                onChange={(e) => setSelectedVisaCard(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                required
              >
                <option value="">Choose Visa card</option>
                {visaCards.map((card) => (
                  <option key={card._id} value={card.cardNumber}>
                **** **** **** {card.cardNumber.slice(-4)} - Rs. {card.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Select NFC Card (Destination)
              </label>
              <select
                value={selectedNfcCard}
                onChange={(e) => setSelectedNfcCard(e.target.value)}
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
                Amount (Rs.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                placeholder="100.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 px-4 rounded-md disabled:bg-gray-400 transform hover:scale-105 transition-all duration-300 hover:shadow-lg font-semibold"
              style={{backgroundColor: '#0B5648'}}
              onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
            >
              {loading ? 'Processing...' : 'Recharge NFC Card'}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-md text-sm text-white" style={{
              backgroundColor: message.includes('✅') ? '#8CDB66' : '#FF6B6B'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Card Information */}
        <div className="space-y-6">
          {/* Visa Cards */}
          <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
            <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>💳 Visa Cards</h2>
            
            {visaCards.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2" style={{color: '#8CDB66'}}>💳</div>
                <p style={{color: '#0B5648'}}>No Visa cards found</p>
                <p className="text-sm" style={{color: '#8CDB66'}}>Add Visa cards first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visaCards.map((card) => (
                  <div key={card._id} className="border rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg" style={{borderColor: '#8CDB66'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium" style={{color: '#0B5648'}}>
                          **** **** **** {card.cardNumber.slice(-4)}
                        </p>
                        <p className="text-sm" style={{color: '#0B5648'}}>{card.cardHolderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{color: '#8CDB66'}}>Rs. {card.balance.toFixed(2)}</p>
                        <p className="text-xs" style={{color: '#0B5648'}}>Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NFC Cards */}
          <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
            <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>📱 NFC Cards</h2>
            
            {nfcCards.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2" style={{color: '#8CDB66'}}>📱</div>
                <p style={{color: '#0B5648'}}>No NFC cards found</p>
                <p className="text-sm" style={{color: '#8CDB66'}}>Add NFC cards first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nfcCards.map((card) => (
                  <div key={card._id} className="border rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg" style={{borderColor: '#8CDB66'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium" style={{color: '#0B5648'}}>
                          Card #{card.cardNumber}
                        </p>
                        <p className="text-sm" style={{color: '#0B5648'}}>{card.cardType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{color: '#8CDB66'}}>Rs. {card.balance.toFixed(2)}</p>
                        <p className="text-xs" style={{color: '#0B5648'}}>Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default RechargePage;

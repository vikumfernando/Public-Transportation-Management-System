import { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [smartCards, setSmartCards] = useState([]);
  const [visaCards, setVisaCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize sample data if needed
      await api.initSampleData();
      
      // For demo, use a test user ID
      const testUserId = "507f1f77bcf86cd799439011"; // This would be from login
      
      const [smartCardsData, visaCardsData, transactionsData] = await Promise.all([
        api.getSmartCards(testUserId),
        api.getVisaCards(testUserId),
        api.getTransactions(testUserId)
      ]);
      
      setSmartCards(smartCardsData);
      setVisaCards(visaCardsData);
      setTransactions(transactionsData.slice(0, 5)); // Recent 5 transactions
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-6" style={{
            borderColor: '#8CDB66',
            borderTopColor: '#0B5648'
          }}></div>
          <div className="text-2xl font-semibold mb-2" style={{color: '#0B5648'}}>Loading your dashboard...</div>
          <div className="text-lg" style={{color: '#8CDB66'}}>Please wait while we prepare everything for you</div>
        </div>
      </div>
    );
  }

  const totalBalance = [...smartCards, ...visaCards].reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4" style={{color: '#0B5648'}}>
              Welcome to TransportPay
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              Your smart transportation companion for seamless travel
            </p>
            <div className="flex justify-center space-x-4">
              <div className="animate-pulse bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💳</span>
              </div>
              <div className="animate-pulse bg-white rounded-full p-4 shadow-lg" style={{animationDelay: '0.2s'}}>
                <span className="text-2xl">📱</span>
              </div>
              <div className="animate-pulse bg-white rounded-full p-4 shadow-lg" style={{animationDelay: '0.4s'}}>
                <span className="text-2xl">🚌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#0B5648'}}>Your Dashboard</h2>
        
        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{borderColor: '#8CDB66'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#8CDB66'}}>
                <span className="text-white text-xl font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Total Balance</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>Rs. {totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{borderColor: '#0B5648'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#0B5648'}}>
                <span className="text-white text-xl font-bold">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Smart Cards</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>{smartCards.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{borderColor: '#8CDB66'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#8CDB66'}}>
                <span className="text-white text-xl font-bold">💳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Visa Cards</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>{visaCards.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{borderColor: '#0B5648'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#0B5648'}}>
                <span className="text-white text-xl font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Transactions</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Smart Cards */}
        <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>📱 Smart Cards (NFC)</h2>
          {smartCards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>📱</div>
              <p className="text-lg" style={{color: '#0B5648'}}>No smart cards found</p>
              <p className="text-sm" style={{color: '#8CDB66'}}>Add your first NFC card to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {smartCards.map((card, index) => (
                <div key={card._id} className="flex justify-between items-center p-4 rounded-lg" style={{
                  backgroundColor: '#F0EBE8'
                }}>
                  <div>
                    <p className="font-medium" style={{color: '#0B5648'}}>Card #{card.cardNumber}</p>
                    <p className="text-sm" style={{color: '#8CDB66'}}>{card.cardType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{color: '#8CDB66'}}>Rs. {card.balance.toFixed(2)}</p>
                    <p className="text-xs" style={{color: '#0B5648'}}>Balance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visa Cards */}
        <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>💳 Visa Cards</h2>
          {visaCards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>💳</div>
              <p className="text-lg" style={{color: '#0B5648'}}>No visa cards found</p>
              <p className="text-sm" style={{color: '#8CDB66'}}>Add your first Visa card to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visaCards.map((card, index) => (
                <div key={card._id} className="flex justify-between items-center p-4 rounded-lg" style={{
                  backgroundColor: '#F0EBE8'
                }}>
                  <div>
                    <p className="font-medium" style={{color: '#0B5648'}}>**** **** **** {card.cardNumber.slice(-4)}</p>
                    <p className="text-sm" style={{color: '#8CDB66'}}>{card.cardHolderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{color: '#8CDB66'}}>Rs. {card.balance.toFixed(2)}</p>
                    <p className="text-xs" style={{color: '#0B5648'}}>Balance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>📊 Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
              <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>📊</div>
            <p className="text-lg" style={{color: '#0B5648'}}>No transactions yet</p>
            <p className="text-sm" style={{color: '#8CDB66'}}>Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{backgroundColor: '#F0EBE8'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{color: '#FF6B6B'}}>
                      -Rs. {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {transaction.transactionType === 'transport_payment' ? '🚌 Transport Payment' : transaction.transactionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}


export default Dashboard;

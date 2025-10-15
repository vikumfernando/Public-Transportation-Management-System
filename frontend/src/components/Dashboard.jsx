import { useState, useEffect } from 'react';
import { api } from '../services/api';
//import '../styles/combined.css';

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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F0EBE8',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #8CDB66',
            borderTop: '4px solid #0B5648',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#0B5648'
          }}>Loading your dashboard...</div>
          <div style={{
            fontSize: '1.125rem',
            color: '#8CDB66'
          }}>Please wait while we prepare everything for you</div>
        </div>
      </div>
    );
  }

  const totalBalance = [...smartCards, ...visaCards].reduce((sum, card) => sum + card.balance, 0);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F0EBE8',
      padding: '1rem'
    }}>

      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="dashboard-floating-icons">
          <div className="dashboard-floating-icon">💳</div>
          <div className="dashboard-floating-icon">📱</div>
          <div className="dashboard-floating-icon">🚌</div>
          <div className="dashboard-floating-icon">💳</div>
        </div>
        <div className="dashboard-hero-content">
          <h1 className="dashboard-hero-title">
            Welcome to TransportPay
          </h1>
          <p className="dashboard-hero-subtitle">
            Your smart transportation companion for seamless travel
          </p>
          <div className="flex justify-center space-x-4">
            <div className="animate-pulse bg-white rounded-full p-4 shadow-lg hover-lift">
              <span className="text-2xl">💳</span>
            </div>
            <div className="animate-pulse bg-white rounded-full p-4 shadow-lg hover-lift" style={{animationDelay: '0.2s'}}>
              <span className="text-2xl">📱</span>
            </div>
            <div className="animate-pulse bg-white rounded-full p-4 shadow-lg hover-lift" style={{animationDelay: '0.4s'}}>
              <span className="text-2xl">🚌</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#0B5648'}}>Your Dashboard</h2>
        
        {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card hover-lift" style={{borderColor: '#8CDB66'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center hover-glow" style={{backgroundColor: '#8CDB66'}}>
                <span className="text-white text-xl font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Total Balance</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>Rs. {totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-lift" style={{borderColor: '#0B5648'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center hover-glow" style={{backgroundColor: '#0B5648'}}>
                <span className="text-white text-xl font-bold">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Smart Cards</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>{smartCards.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-lift" style={{borderColor: '#8CDB66'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center hover-glow" style={{backgroundColor: '#8CDB66'}}>
                <span className="text-white text-xl font-bold">💳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: '#0B5648'}}>Visa Cards</p>
              <p className="text-2xl font-bold" style={{color: '#0B5648'}}>{visaCards.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-lift" style={{borderColor: '#0B5648'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center hover-glow" style={{backgroundColor: '#0B5648'}}>
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
      <div className="cards-grid">
        {/* Smart Cards */}
        <div className="card-section hover-lift">
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>📱 Smart Cards (NFC)</h2>
          {smartCards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📱</div>
              <div className="empty-state-title">No smart cards found</div>
              <div className="empty-state-text">Add your first NFC card to get started</div>
            </div>
          ) : (
            <div className="card-list">
              {smartCards.map((card, index) => (
                <div key={card._id} className="card-item">
                  <div className="card-info">
                    <div className="card-icon">📱</div>
                    <div className="card-details">
                      <div className="card-name">Card #{card.cardNumber}</div>
                      <div className="card-number">{card.cardType}</div>
                    </div>
                  </div>
                  <div className="card-balance">Rs. {card.balance.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visa Cards */}
        <div className="card-section hover-lift">
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>💳 Visa Cards</h2>
          {visaCards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-title">No visa cards found</div>
              <div className="empty-state-text">Add your first Visa card to get started</div>
            </div>
          ) : (
            <div className="card-list">
              {visaCards.map((card, index) => (
                <div key={card._id} className="card-item">
                  <div className="card-info">
                    <div className="card-icon">💳</div>
                    <div className="card-details">
                      <div className="card-name">**** **** **** {card.cardNumber.slice(-4)}</div>
                      <div className="card-number">{card.cardHolderName}</div>
                    </div>
                  </div>
                  <div className="card-balance">{card.bank || 'Bank Not Set'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 card-section hover-lift">
        <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>📊 Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No transactions yet</div>
            <div className="empty-state-text">Your transaction history will appear here</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction._id}>
                    <td>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                    </td>
                    <td className="transaction-amount negative">
                      -Rs. {transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      {transaction.transactionType === 'transport_payment' ? '🚌 Transport Payment' : transaction.transactionType}
                    </td>
                    <td>
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

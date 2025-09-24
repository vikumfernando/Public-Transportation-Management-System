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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <div style={{fontSize: '1.125rem', color: '#374151'}}>Loading cards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 0',
        marginBottom: '3rem'
      }}>
        {/* Floating Icons */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '2rem',
          opacity: '0.1',
          animation: 'float 6s ease-in-out infinite'
        }}>💳</div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          fontSize: '1.5rem',
          opacity: '0.1',
          animation: 'float 8s ease-in-out infinite reverse'
        }}>📱</div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          fontSize: '1.8rem',
          opacity: '0.1',
          animation: 'float 7s ease-in-out infinite'
        }}>💰</div>
        <div style={{
          position: 'absolute',
          bottom: '30%',
          right: '10%',
          fontSize: '2.2rem',
          opacity: '0.1',
          animation: 'float 9s ease-in-out infinite reverse'
        }}>🔄</div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          zIndex: '1'
        }}>
          <div style={{textAlign: 'center'}}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem auto',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{fontSize: '3rem'}}>💳</span>
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              Recharge NFC Card
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Transfer funds from Visa card to NFC card seamlessly
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{fontSize: '1.5rem'}}>💳</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{fontSize: '1.5rem'}}>➡️</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{fontSize: '1.5rem'}}>📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem 2rem 1rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
        {/* Recharge Form */}
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            borderRadius: '1.5rem 1.5rem 0 0'
          }}></div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{fontSize: '1.5rem'}}>💳</span>
            Recharge with Visa Card
          </h2>
          
          <form onSubmit={handleRecharge} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Select Visa Card (Source)
              </label>
              <select
                value={selectedVisaCard}
                onChange={(e) => setSelectedVisaCard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'scale(1)';
                }}
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
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Select NFC Card (Destination)
              </label>
              <select
                value={selectedNfcCard}
                onChange={(e) => setSelectedNfcCard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'scale(1)';
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
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Amount (Rs.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'scale(1)';
                }}
                placeholder="100.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                opacity: loading ? '0.7' : '1'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Processing...' : '💳 Recharge NFC Card'}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: message.includes('✅') ? '#10b981' : '#ef4444',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Card Information */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {/* Visa Cards */}
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '1.5rem 1.5rem 0 0'
            }}></div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{fontSize: '1.5rem'}}>💳</span>
              Visa Cards
            </h2>
            
            {visaCards.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '1rem',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem', opacity: '0.6'}}>💳</div>
                <p style={{color: '#374151', fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>No Visa cards found</p>
                <p style={{color: '#6b7280', fontSize: '0.875rem', margin: '0'}}>Add Visa cards first to start recharging</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {visaCards.map((card) => (
                  <div key={card._id} style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          color: '#1f2937',
                          fontSize: '1rem',
                          margin: '0 0 0.25rem 0'
                        }}>
                          **** **** **** {card.cardNumber.slice(-4)}
                        </p>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: '0'
                        }}>{card.cardHolderName}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{
                          fontWeight: '700',
                          color: '#3b82f6',
                          fontSize: '1.125rem',
                          margin: '0 0 0.25rem 0'
                        }}>Rs. {card.balance.toFixed(2)}</p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: '0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NFC Cards */}
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '1.5rem 1.5rem 0 0'
            }}></div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{fontSize: '1.5rem'}}>📱</span>
              NFC Cards
            </h2>
            
            {nfcCards.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '1rem',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem', opacity: '0.6'}}>📱</div>
                <p style={{color: '#374151', fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>No NFC cards found</p>
                <p style={{color: '#6b7280', fontSize: '0.875rem', margin: '0'}}>Add NFC cards first to receive recharges</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {nfcCards.map((card) => (
                  <div key={card._id} style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          color: '#1f2937',
                          fontSize: '1rem',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Card #{card.cardNumber}
                        </p>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: '0'
                        }}>{card.cardType}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{
                          fontWeight: '700',
                          color: '#3b82f6',
                          fontSize: '1.125rem',
                          margin: '0 0 0.25rem 0'
                        }}>Rs. {card.balance.toFixed(2)}</p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: '0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Balance</p>
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

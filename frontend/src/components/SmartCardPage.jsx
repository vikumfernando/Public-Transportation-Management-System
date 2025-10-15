import { useState, useEffect } from 'react';
import { api } from '../services/api';

function SmartCardPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    balance: '',
    cardType: 'NFC'
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      const cardsData = await api.getSmartCards(testUserId);
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const testUserId = "507f1f77bcf86cd799439011";
      
      if (editingCard) {
        // Update existing card
        await api.updateSmartCard(editingCard._id, {
          ...formData,
          balance: parseFloat(formData.balance) || 0
        });
      } else {
        // Add new card
        await api.addSmartCard({
          ...formData,
          userId: testUserId,
          balance: parseFloat(formData.balance) || 0
        });
      }
      
      setFormData({ cardNumber: '', balance: '', cardType: 'NFC' });
      setShowAddForm(false);
      setEditingCard(null);
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      cardNumber: card.cardNumber,
      balance: card.balance.toString(),
      cardType: card.cardType
    });
    setShowAddForm(true);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this smart card?')) {
      try {
        await api.deleteSmartCard(cardId);
        loadCards();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingCard(null);
    setFormData({ cardNumber: '', balance: '', cardType: 'NFC' });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading smart cards...</div>
        </div>
      </div>
    );
  }

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
              Smart Cards (NFC)
            </h1>
            <p style={{fontSize: '1.125rem', marginBottom: '2rem', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'}}>
              Manage your NFC smart cards for transport payments
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
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{fontSize: '1.5rem'}}>💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', paddingBottom: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.875rem', fontWeight: '700', color: '#1f2937'}}> Your Smart Cards</h2>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.875rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
            }}
          >
            + Add Smart Card
          </button>
        </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '1.5rem',
          marginBottom: '2rem',
          transition: 'all 0.2s ease-in-out'
        }}>
          <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
            {editingCard ? 'Edit Smart Card' : 'Add New Smart Card'}
          </h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Card Number
              </label>
              <input
                type="text"
                disabled = {true}
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
                placeholder="1234567890"
                required
              />
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Card Type
              </label>
              <select
                value={formData.cardType}
                onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <option value="NFC">NFC Card</option>
                <option value="RFID">RFID Card</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Initial Balance
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                type="submit"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4b5563';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6b7280';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem'}}>
        {cards.length === 0 ? (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0'}}>
            <div style={{fontSize: '4rem', marginBottom: '1rem', color: '#9ca3af'}}>📱</div>
            <p style={{fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>No smart cards found</p>
            <p style={{color: '#6b7280'}}>Add your first smart card to get started</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card._id} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '1.25rem',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '1.25rem',
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
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}>
              {/* Card Header with Icon */}
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  <span style={{fontSize: '1.25rem', color: 'white'}}>📱</span>
                </div>
                <div style={{flex: '1'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.25rem 0', lineHeight: '1.2'}}>
                    Card #{card.cardNumber}
                  </h3>
                  <p style={{fontSize: '0.75rem', color: '#10b981', margin: '0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{card.cardType}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontSize: '1.25rem', fontWeight: '800', color: '#059669', margin: '0', lineHeight: '1'}}>Rs. {card.balance.toFixed(2)}</p>
                  <p style={{fontSize: '0.7rem', color: '#64748b', margin: '0', fontWeight: '500'}}>Balance</p>
                </div>
              </div>
              
              {/* Card Details - Compact */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.75rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    background: card.isActive ? '#10b981' : '#ef4444'
                  }}></div>
                  <span style={{fontSize: '0.8rem', color: '#475569', fontWeight: '500'}}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                  {new Date(card.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {/* Action Buttons - Enhanced */}
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button
                  onClick={() => handleEdit(card)}
                  style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default SmartCardPage;

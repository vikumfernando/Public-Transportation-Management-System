import { useState, useEffect } from 'react';
import { api } from '../services/api';

function VisaCardPage() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    balance: ''
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      const cardsData = await api.getVisaCards(testUserId);
      setCards(cardsData);
      setFilteredCards(cardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter(card => 
        card.cardNumber.slice(-4).includes(searchTerm.trim())
      );
      setFilteredCards(filtered);
    }
  }, [searchTerm, cards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const testUserId = "507f1f77bcf86cd799439011";
      
      if (editingCard) {
        // Update existing card
        await api.updateVisaCard(editingCard._id, {
          ...formData,
          balance: parseFloat(formData.balance) || 0
        });
        setEditingCard(null);
      } else {
        // Add new card
        await api.addVisaCard({
          ...formData,
          userId: testUserId,
          balance: parseFloat(formData.balance) || 0
        });
      }
      
      setFormData({ cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', balance: '' });
      setShowAddForm(false);
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      cardNumber: card.cardNumber,
      cardHolderName: card.cardHolderName,
      expiryDate: card.expiryDate,
      cvv: card.cvv,
      balance: card.balance.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this Visa card?')) {
      try {
        await api.deleteVisaCard(cardId);
        loadCards();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingCard(null);
    setFormData({ cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', balance: '' });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading visa cards...</div>
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
              Visa Cards
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              Manage your Visa cards for secure payments
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💳</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold" style={{color: '#0B5648'}}>💳 Your Visa Cards</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-white px-4 py-2 rounded-md transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
          style={{backgroundColor: '#0B5648'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
        >
          + Add Visa Card
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by last 4 digits..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
            style={{borderColor: '#8CDB66'}}
          />
        </div>
      </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div className="rounded-lg shadow-lg p-6 mb-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>
            {editingCard ? 'Edit Visa Card' : 'Add New Visa Card'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Card Number
              </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    // Only allow digits and limit to 16 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setFormData({ ...formData, cardNumber: value });
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                  style={{borderColor: '#8CDB66'}}
                  placeholder="4532123456789012"
                  maxLength="16"
                  required
                />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Card Holder Name
              </label>
              <input
                type="text"
                value={formData.cardHolderName}
                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                style={{borderColor: '#8CDB66'}}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                  Expiry Date (MM/YY)
                </label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setFormData({ ...formData, expiryDate: value });
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                  style={{borderColor: '#8CDB66'}}
                  placeholder="12/25"
                  maxLength="5"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                  CVV
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => {
                    // Only allow digits and limit to 3 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setFormData({ ...formData, cvv: value });
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                  style={{borderColor: '#8CDB66'}}
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Initial Balance
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded-md transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                style={{backgroundColor: '#0B5648'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
              >
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-white px-4 py-2 rounded-md transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                style={{backgroundColor: '#8CDB66'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0B5648'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8CDB66'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>💳</div>
            <p className="text-xl" style={{color: '#0B5648'}}>
              {searchTerm ? 'No cards found matching your search' : 'No visa cards found'}
            </p>
            <p style={{color: '#8CDB66'}}>
              {searchTerm ? 'Try a different search term' : 'Add your first visa card to get started'}
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div key={card._id} className="rounded-lg shadow-lg p-6 border-l-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF', borderColor: '#8CDB66'}}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{color: '#0B5648'}}>
                    **** **** **** {card.cardNumber.slice(-4)}
                  </h3>
                  <p className="text-sm" style={{color: '#0B5648'}}>{card.cardHolderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{color: '#8CDB66'}}>Rs. {card.balance.toFixed(2)}</p>
                  <p className="text-xs" style={{color: '#0B5648'}}>Balance</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{color: '#0B5648'}}>Expiry:</span>
                  <span style={{color: '#0B5648'}}>{card.expiryDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{color: '#0B5648'}}>Status:</span>
                  <span className="px-2 py-1 rounded text-xs text-white" style={{
                    backgroundColor: card.isActive ? '#8CDB66' : '#FF6B6B'
                  }}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{color: '#0B5648'}}>Created:</span>
                  <span style={{color: '#0B5648'}}>{new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 text-white px-3 py-2 rounded-md text-sm transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  style={{backgroundColor: '#0B5648'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="flex-1 text-white px-3 py-2 rounded-md text-sm transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  style={{backgroundColor: '#FF6B6B'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#FF5252'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#FF6B6B'}
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

export default VisaCardPage;

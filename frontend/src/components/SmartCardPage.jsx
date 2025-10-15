import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from '../styles/combined.module.css';

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
    <div className={styles.smartCardMainContainer}>
      {/* Hero Section */}
      <div className={styles.smartCardHero}>
        {/* Dark overlay pattern */}
        <div className={styles.smartCardHeroPattern}></div>
        
        <div className={styles.smartCardHeroContent}>
          <div className={styles.smartCardHeroText}>
            <h1 className={styles.smartCardHeroTitle}>
              Smart Cards (NFC)
            </h1>
            <p className={styles.smartCardHeroSubtitle}>
              Manage your NFC smart cards for transport payments
            </p>
            <div className={styles.smartCardHeroIcons}>
              <div className={styles.smartCardHeroIcon}>
                <span>📱</span>
              </div>
              <div className={styles.smartCardHeroIcon}>
                <span>🚌</span>
              </div>
              <div className={styles.smartCardHeroIcon}>
                <span>💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.smartCardMainContent}>
        <div className={styles.smartCardHeader}>
          <h2 className={styles.smartCardPageTitle}> Your Smart Cards</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.smartCardAddButton}
          >
            + Add Smart Card
          </button>
        </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div className={styles.smartCardFormContainer}>
          <h2 className={styles.smartCardFormTitle}>
            {editingCard ? 'Edit Smart Card' : 'Add New Smart Card'}
          </h2>
          <form onSubmit={handleSubmit} className={styles.smartCardForm}>
            <div className={styles.smartCardFieldContainer}>
              <label className={styles.smartCardFieldLabel}>
                Card Number
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                className={styles.smartCardFieldInput}
                placeholder="1234567890"
                required
              />
            </div>

            <div className={styles.smartCardFieldContainer}>
              <label className={styles.smartCardFieldLabel}>
                Card Type
              </label>
              <select
                value={formData.cardType}
                onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                className={styles.smartCardFieldSelect}
              >
                <option value="NFC">NFC Card</option>
                <option value="RFID">RFID Card</option>
              </select>
            </div>

            <div className={styles.smartCardFieldContainer}>
              <label className={styles.smartCardFieldLabel}>
                Initial Balance
              </label>
              <input
                type="number"
                disabled = {true}
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className={styles.smartCardFieldInputDisabled}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.smartCardActionButtons}>
              <button
                type="submit"
                className={styles.smartCardSubmitButton}
              >
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.smartCardCancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div className={styles.smartCardCardsGrid}>
        {cards.length === 0 ? (
          <div className={styles.smartCardEmptyState}>
            <div className={styles.smartCardEmptyStateIcon}>📱</div>
            <p className={styles.smartCardEmptyStateTitle}>No smart cards found</p>
            <p className={styles.smartCardEmptyStateText}>Add your first smart card to get started</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card._id} className={styles.smartCardItem}>
              {/* Card Header with Icon */}
              <div className={styles.smartCardItemHeader}>
                <div className={styles.smartCardItemIcon}>
                  <span>📱</span>
                </div>
                <div className={styles.smartCardItemActions}>
                  <button
                    onClick={() => handleEdit(card)}
                    className={`${styles.smartCardItemActionButton} ${styles.smartCardItemEditButton}`}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(card._id)}
                    className={`${styles.smartCardItemActionButton} ${styles.smartCardItemDeleteButton}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Card Content */}
              <div className={styles.smartCardItemContent}>
                <div className={styles.smartCardItemNumber}>
                  Card #{card.cardNumber}
                </div>
                <div className={styles.smartCardItemType}>
                  {card.cardType}
                </div>
                <div className={styles.smartCardItemBalance}>
                  Rs. {card.balance.toFixed(2)}
                </div>
                <div className={styles.smartCardItemBalanceLabel}>
                  Balance
                </div>
              </div>
              
              {/* Card Footer */}
              <div className={styles.smartCardItemFooter}>
                <div className={styles.smartCardItemStatus}>
                  <div className={styles.smartCardItemStatusDot}></div>
                  <span className={styles.smartCardItemStatusText}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.smartCardItemDate}>
                  {new Date(card.createdAt).toLocaleDateString()}
                </div>
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

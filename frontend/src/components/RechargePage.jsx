import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from '../styles/combined.module.css';

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
      <div className={styles.rechargeLoadingContainer}>
        <div className={styles.rechargeLoadingContent}>
          <div className={styles.rechargeLoadingSpinner}></div>
          <div className={styles.rechargeLoadingText}>Loading cards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.rechargeMainContainer}`}>
      {/* Hero Section */}
      <div className={styles.rechargeHero}>
        {/* Floating Icons */}
        <div className={styles.rechargeHeroPattern}>💳</div>
        <div className={styles.rechargeHeroPattern}>📱</div>
        <div className={styles.rechargeHeroPattern}>💰</div>
        <div className={styles.rechargeHeroPattern}>🔄</div>

        <div className={styles.rechargeHeroContent}>
          <div className={styles.rechargeHeroText}>
            <div className={styles.rechargeHeroIcon}>
              <span>💳</span>
            </div>
            <h1 className={styles.rechargeHeroTitle}>
              Recharge NFC Card
            </h1>
            <p className={styles.rechargeHeroSubtitle}>
              Transfer funds from Visa card to NFC card seamlessly
            </p>
            <div className={styles.rechargeHeroIcons}>
              <div className={styles.rechargeHeroIconSmall}>
                <span>💳</span>
              </div>
              <div className={styles.rechargeHeroIconSmall}>
                <span>➡️</span>
              </div>
              <div className={styles.rechargeHeroIconSmall}>
                <span>📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rechargeMainContent}>
        <div className={styles.rechargeGrid}>
        {/* Recharge Form */}
        <div className={styles.rechargeFormContainer}>
          <div className={styles.rechargeFormHeader}></div>
          <h2 className={styles.rechargeFormTitle}>
            <span>💳</span>
            Recharge with Visa Card
          </h2>
          
          <form onSubmit={handleRecharge} className={styles.rechargeForm}>
            <div className={styles.rechargeFormField}>
              <label className={styles.rechargeFormLabel}>
                Select Visa Card (Source)
              </label>
              <select
                value={selectedVisaCard}
                onChange={(e) => setSelectedVisaCard(e.target.value)}
                className={styles.rechargeFormSelect}
                required
              >
                <option value="">Choose Visa card</option>
                {visaCards.map((card) => (
                  <option key={card._id} value={card.cardNumber}>
                **** **** **** {card.cardNumber.slice(-4)} - {card.bank || 'Bank Not Set'}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.rechargeFormField}>
              <label className={styles.rechargeFormLabel}>
                Select NFC Card (Destination)
              </label>
              <select
                value={selectedNfcCard}
                onChange={(e) => setSelectedNfcCard(e.target.value)}
                className={styles.rechargeFormSelect}
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

            <div className={styles.rechargeFormField}>
              <label className={styles.rechargeFormLabel}>
                Amount (Rs.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.rechargeFormInput}
                placeholder="100.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.rechargeFormButton}
            >
              {loading ? '⏳ Processing...' : '💳 Recharge NFC Card'}
            </button>
          </form>

          {message && (
            <div className={`${styles.rechargeMessage} ${message.includes('✅') ? styles.rechargeMessageSuccess : styles.rechargeMessageError}`}>
              {message}
            </div>
          )}
        </div>

        {/* Card Information */}
        <div className={styles.rechargeCardsContainer}>
          {/* Visa Cards */}
          <div className={styles.rechargeCardSection}>
            <div className={styles.rechargeCardHeader}></div>
            <h2 className={styles.rechargeCardTitle}>
              <span>💳</span>
              Visa Cards
            </h2>
            
            {visaCards.length === 0 ? (
              <div className={styles.rechargeEmptyState}>
                <div className={styles.rechargeEmptyStateIcon}>💳</div>
                <p className={styles.rechargeEmptyStateTitle}>No Visa cards found</p>
                <p className={styles.rechargeEmptyStateText}>Add Visa cards first to start recharging</p>
              </div>
            ) : (
              <div className={styles.rechargeCardsList}>
                {visaCards.map((card) => (
                  <div key={card._id} className={styles.rechargeCardItem}>
                    <div className={styles.rechargeCardContent}>
                      <div className={styles.rechargeCardInfo}>
                        <p className={styles.rechargeCardNumber}>
                          **** **** **** {card.cardNumber.slice(-4)}
                        </p>
                        <p className={styles.rechargeCardDetails}>{card.cardHolderName}</p>
                      </div>
                      <div className={styles.rechargeCardBalance}>
                        <p className={styles.rechargeCardBalanceAmount}>{card.bank || 'Bank Not Set'}</p>
                        <p className={styles.rechargeCardBalanceLabel}>Bank</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NFC Cards */}
          <div className={styles.rechargeCardSection}>
            <div className={styles.rechargeCardHeader}></div>
            <h2 className={styles.rechargeCardTitle}>
              <span>📱</span>
              NFC Cards
            </h2>
            
            {nfcCards.length === 0 ? (
              <div className={styles.rechargeEmptyState}>
                <div className={styles.rechargeEmptyStateIcon}>📱</div>
                <p className={styles.rechargeEmptyStateTitle}>No NFC cards found</p>
                <p className={styles.rechargeEmptyStateText}>Add NFC cards first to receive recharges</p>
              </div>
            ) : (
              <div className={styles.rechargeCardsList}>
                {nfcCards.map((card) => (
                  <div key={card._id} className={styles.rechargeCardItem}>
                    <div className={styles.rechargeCardContent}>
                      <div className={styles.rechargeCardInfo}>
                        <p className={styles.rechargeCardNumber}>
                          Card #{card.cardNumber}
                        </p>
                        <p className={styles.rechargeCardDetails}>{card.cardType}</p>
                      </div>
                      <div className={styles.rechargeCardBalance}>
                        <p className={styles.rechargeCardBalanceAmount}>Rs. {card.balance.toFixed(2)}</p>
                        <p className={styles.rechargeCardBalanceLabel}>Balance</p>
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

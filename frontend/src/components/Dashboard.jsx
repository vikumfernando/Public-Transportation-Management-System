import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from '../styles/combined.module.css';

function Dashboard() {
  //const [user, setUser] = useState(null);
  const [smartCards, setSmartCards] = useState([]);
  const [visaCards, setVisaCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
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
      setTransactions(transactionsData.slice(0, 5)); // Recent 5 transactions for display
      setTotalTransactionCount(transactionsData.length); // Total count for stats
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardLoadingState}>
        <div className={styles.dashboardLoadingSpinner}></div>
        <div className={styles.dashboardLoadingText}>Loading your dashboard...</div>
      </div>
    );
  }

  const totalBalance = smartCards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className={styles.dashboardMainContainer}>
      {/* Enhanced Hero Section */}
      <div className={styles.dashboardHero}>
        <div className={styles.dashboardHeroBackground}>
          <div className={styles.dashboardHeroPattern}></div>
        </div>
        <div className={styles.dashboardFloatingIcons}>
          <div className={styles.dashboardFloatingIcon} style={{animationDelay: '0s'}}>💳</div>
          <div className={styles.dashboardFloatingIcon} style={{animationDelay: '1s'}}>📱</div>
          <div className={styles.dashboardFloatingIcon} style={{animationDelay: '2s'}}>🚌</div>
          <div className={styles.dashboardFloatingIcon} style={{animationDelay: '3s'}}>🚀</div>
        </div>
        <div className={styles.dashboardHeroContent}>
          <div className={styles.dashboardHeroWelcome}>
            <h1 className={styles.dashboardHeroTitle}>
              Welcome to <span className={styles.dashboardHeroTitleAccent}>TransportPay</span>
            </h1>
            <p className={styles.dashboardHeroSubtitle}>
              Your smart transportation companion for seamless travel
            </p>
            <div className={styles.dashboardHeroStats}>
              <div className={styles.dashboardHeroStat}>
                <div className={styles.dashboardHeroStatIcon}>💰</div>
                <div className={styles.dashboardHeroStatText}>
                  <div className={styles.dashboardHeroStatValue}>Rs. {totalBalance.toFixed(2)}</div>
                  <div className={styles.dashboardHeroStatLabel}>NFC Balance</div>
                </div>
              </div>
              <div className={styles.dashboardHeroStat}>
                <div className={styles.dashboardHeroStatIcon}>📊</div>
                <div className={styles.dashboardHeroStatText}>
                  <div className={styles.dashboardHeroStatValue}>{totalTransactionCount}</div>
                  <div className={styles.dashboardHeroStatLabel}>Transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dashboardMainContent}>
        {/* Enhanced Stats Cards */}
        <div className={styles.dashboardStatsGrid}>
          <div className={`${styles.dashboardStatCard} ${styles.dashboardStatCardPrimary}`}>
            <div className={styles.dashboardStatCardIcon}>
              <div className={styles.dashboardStatIconWrapper}>
                💰
              </div>
            </div>
            <div className={styles.dashboardStatCardContent}>
              <div className={styles.dashboardStatTitle}>NFC Balance</div>
              <div className={styles.dashboardStatValue}>Rs. {totalBalance.toFixed(2)}</div>
              <div className={styles.dashboardStatTrend}>
                <span className={styles.dashboardStatTrendIcon}>📈</span>
                <span className={styles.dashboardStatTrendText}>+12.5% this month</span>
              </div>
            </div>
          </div>

          <div className={styles.dashboardStatCard}>
            <div className={styles.dashboardStatCardIcon}>
              <div className={styles.dashboardStatIconWrapper}>
                📱
              </div>
            </div>
            <div className={styles.dashboardStatCardContent}>
              <div className={styles.dashboardStatTitle}>Smart Cards</div>
              <div className={styles.dashboardStatValue}>{smartCards.length}</div>
              <div className={styles.dashboardStatSubtext}>NFC Cards</div>
            </div>
          </div>

          <div className={styles.dashboardStatCard}>
            <div className={styles.dashboardStatCardIcon}>
              <div className={styles.dashboardStatIconWrapper}>
                💳
              </div>
            </div>
            <div className={styles.dashboardStatCardContent}>
              <div className={styles.dashboardStatTitle}>Visa Cards</div>
              <div className={styles.dashboardStatValue}>{visaCards.length}</div>
              <div className={styles.dashboardStatSubtext}>Bank Cards</div>
            </div>
          </div>

          <div className={styles.dashboardStatCard}>
            <div className={styles.dashboardStatCardIcon}>
              <div className={styles.dashboardStatIconWrapper}>
                📊
              </div>
            </div>
            <div className={styles.dashboardStatCardContent}>
              <div className={styles.dashboardStatTitle}>Transactions</div>
              <div className={styles.dashboardStatValue}>{totalTransactionCount}</div>
              <div className={styles.dashboardStatSubtext}>Total Count</div>
            </div>
          </div>
        </div>

        {/* Enhanced Cards Section */}
        <div className={styles.dashboardCardsGrid}>
          {/* Enhanced Smart Cards */}
          <div className={styles.dashboardCardSection}>
            <div className={styles.dashboardCardSectionHeader}>
              <div className={styles.dashboardCardSectionTitleWrapper}>
                <div className={styles.dashboardCardSectionIcon}>📱</div>
                <div>
                  <h2 className={styles.dashboardCardSectionTitle}>Smart Cards (NFC)</h2>
                  <p className={styles.dashboardCardSectionSubtitle}>Your contactless payment cards</p>
                </div>
              </div>
              <div className={styles.dashboardCardSectionCount}>{smartCards.length}</div>
            </div>
            {smartCards.length === 0 ? (
              <div className={styles.dashboardEmptyState}>
                <div className={styles.dashboardEmptyStateIcon}>📱</div>
                <div className={styles.dashboardEmptyStateTitle}>No smart cards found</div>
                <div className={styles.dashboardEmptyStateText}>Add your first NFC card to get started</div>
                <button className={styles.dashboardEmptyStateButton}>Add Card</button>
              </div>
            ) : (
              <div className={styles.dashboardCardList}>
                {smartCards.map((card, index) => (
                  <div key={card._id} className={styles.dashboardCardItem}>
                    <div className={styles.dashboardCardItemLeft}>
                      <div className={styles.dashboardCardIcon}>📱</div>
                      <div className={styles.dashboardCardDetails}>
                        <div className={styles.dashboardCardName}>Card #{card.cardNumber}</div>
                        <div className={styles.dashboardCardNumber}>{card.cardType}</div>
                      </div>
                    </div>
                    <div className={styles.dashboardCardItemRight}>
                      <div className={styles.dashboardCardBalance}>Rs. {card.balance.toFixed(2)}</div>
                      <div className={styles.dashboardCardStatus}>Active</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Visa Cards */}
          <div className={styles.dashboardCardSection}>
            <div className={styles.dashboardCardSectionHeader}>
              <div className={styles.dashboardCardSectionTitleWrapper}>
                <div className={styles.dashboardCardSectionIcon}>💳</div>
                <div>
                  <h2 className={styles.dashboardCardSectionTitle}>Visa Cards</h2>
                  <p className={styles.dashboardCardSectionSubtitle}>Your bank-issued payment cards</p>
                </div>
              </div>
              <div className={styles.dashboardCardSectionCount}>{visaCards.length}</div>
            </div>
            {visaCards.length === 0 ? (
              <div className={styles.dashboardEmptyState}>
                <div className={styles.dashboardEmptyStateIcon}>💳</div>
                <div className={styles.dashboardEmptyStateTitle}>No visa cards found</div>
                <div className={styles.dashboardEmptyStateText}>Add your first Visa card to get started</div>
                <button className={styles.dashboardEmptyStateButton}>Add Card</button>
              </div>
            ) : (
              <div className={styles.dashboardCardList}>
                {visaCards.map((card, index) => (
                  <div key={card._id} className={styles.dashboardCardItem}>
                    <div className={styles.dashboardCardItemLeft}>
                      <div className={styles.dashboardCardIcon}>💳</div>
                      <div className={styles.dashboardCardDetails}>
                        <div className={styles.dashboardCardName}>**** **** **** {card.cardNumber.slice(-4)}</div>
                        <div className={styles.dashboardCardNumber}>{card.cardHolderName}</div>
                      </div>
                    </div>
                    <div className={styles.dashboardCardItemRight}>
                      <div className={styles.dashboardCardBalance}>{card.bank || 'Bank Not Set'}</div>
                      <div className={styles.dashboardCardStatus}>Active</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Recent Transactions */}
        <div className={styles.dashboardCardSection}>
          <div className={styles.dashboardCardSectionHeader}>
            <div className={styles.dashboardCardSectionTitleWrapper}>
              <div className={styles.dashboardCardSectionIcon}>📊</div>
              <div>
                <h2 className={styles.dashboardCardSectionTitle}>Recent Transactions</h2>
                <p className={styles.dashboardCardSectionSubtitle}>Your latest payment activities</p>
              </div>
            </div>
            <div className={styles.dashboardCardSectionCount}>{totalTransactionCount}</div>
          </div>
          {totalTransactionCount === 0 ? (
            <div className={styles.dashboardEmptyState}>
              <div className={styles.dashboardEmptyStateIcon}>📊</div>
              <div className={styles.dashboardEmptyStateTitle}>No transactions yet</div>
              <div className={styles.dashboardEmptyStateText}>Your transaction history will appear here</div>
            </div>
          ) : (
            <div className={styles.transactionsContainer}>
              <div className={styles.transactionsTableWrapper}>
                <table className={styles.transactionsTable}>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction._id} className={styles.transactionRow}>
                        <td>
                          <div className={styles.transactionCardInfo}>
                            <div className={styles.transactionCardIcon}>
                              {transaction.cardNumber.length > 12 ? '💳' : '📱'}
                            </div>
                            <div className={styles.transactionCardDetails}>
                              <div className={styles.transactionCardNumber}>
                                {transaction.cardNumber.length > 12 
                                  ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                                  : 'Card #' + transaction.cardNumber
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.transactionAmount}>
                            -Rs. {transaction.amount.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div className={styles.transactionType}>
                            <span className={styles.transactionTypeIcon}>🚌</span>
                            <span className={styles.transactionTypeText}>
                              {transaction.transactionType === 'transport_payment' ? 'Transport Payment' : transaction.transactionType}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.transactionDate}>
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className={styles.transactionStatus}>
                            <span className={styles.transactionStatusBadge}>Completed</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import jsPDF from 'jspdf';
import styles from '../styles/combined.module.css';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [stopNames, setStopNames] = useState({});

  useEffect(() => {
    loadTransactions();
  }, []);

  // Function to check if a string is a valid ObjectId
  const isObjectId = (str) => {
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  // Function to get stop name from ObjectId or return the name if it's already a name
  const getStopName = (locationId) => {
    if (!locationId) return 'Unknown';
    
    // If it's already a name (not an ObjectId), return it
    if (!isObjectId(locationId)) {
      return locationId;
    }
    
    // If it's an ObjectId, return the cached name or the ObjectId as fallback
    return stopNames[locationId] || locationId;
  };

  // Function to fetch stop names for ObjectIds
  const fetchStopNames = async (objectIds) => {
    if (objectIds.length === 0) return;
    
    try {
      const response = await fetch(`http://localhost:8070/BusStops/loadstops`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const nameMap = {};
        data.forEach(stop => {
          if (stop._id && objectIds.includes(stop._id)) {
            nameMap[stop._id] = stop.stopName;
          }
        });
        setStopNames(prev => ({ ...prev, ...nameMap }));
      }
    } catch (error) {
      console.error('Error fetching stop names:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      const transactionsData = await api.getTransactions(testUserId);
      setTransactions(transactionsData);
      
      // Extract ObjectIds from transactions that need stop name resolution
      const objectIds = [];
      transactionsData.forEach(transaction => {
        if (transaction.fromLocation && isObjectId(transaction.fromLocation)) {
          objectIds.push(transaction.fromLocation);
        }
        if (transaction.toLocation && isObjectId(transaction.toLocation)) {
          objectIds.push(transaction.toLocation);
        }
      });
      
      // Remove duplicates
      const uniqueObjectIds = [...new Set(objectIds)];
      
      // Fetch stop names for these ObjectIds
      if (uniqueObjectIds.length > 0) {
        await fetchStopNames(uniqueObjectIds);
      }
      
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || transaction.transactionType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'amount':
          return b.amount - a.amount;
        case 'type':
          return a.transactionType.localeCompare(b.transactionType);
        default:
          return 0;
      }
    });

  const generatePDF = (transaction) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('TransportPay Receipt', 20, 30);
    
    // Company info
    doc.setFontSize(12);
    doc.text('TransportPay System', 20, 45);
    doc.text('Sri Lanka Public Transport', 20, 52);
    doc.text('Digital Receipt', 20, 59);
    
    // Transaction details
    doc.setFontSize(14);
    doc.text('Transaction Details:', 20, 80);
    
    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transaction._id}`, 20, 95);
    doc.text(`Card: **** **** **** ${transaction.cardNumber.slice(-4)}`, 20, 105);
    doc.text(`Amount: Rs. ${transaction.amount.toFixed(2)}`, 20, 115);
    doc.text(`Type: ${transaction.transactionType === 'transport_payment' ? 'Transport Payment' : transaction.transactionType}`, 20, 125);
    doc.text(`Status: ${transaction.status}`, 20, 135);
    doc.text(`Date: ${new Date(transaction.timestamp).toLocaleString()}`, 20, 145);
    
    // Add transport payment details if available
        if (transaction.transactionType === 'transport_payment') {
          if (transaction.fromLocation && transaction.toLocation) {
            doc.text(`Route: ${getStopName(transaction.fromLocation)} to ${getStopName(transaction.toLocation)}`, 20, 155);
          }
      if (transaction.meta && transaction.meta.bus && transaction.meta.bus.vehicleNumber) {
        doc.text(`Bus: ${transaction.meta.bus.vehicleNumber}`, 20, 165);
      }
      if (transaction.meta && transaction.meta.seatNumbers && transaction.meta.seatNumbers.length > 0) {
        doc.text(`Seats: ${transaction.meta.seatNumbers.join(', ')}`, 20, 175);
      }
      if (transaction.meta && transaction.meta.travelDate) {
        doc.text(`Travel Date: ${new Date(transaction.meta.travelDate).toLocaleDateString()}`, 20, 185);
      }
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for using TransportPay!', 20, 200);
    doc.text('This is a digital receipt.', 20, 207);
    
    // Save the PDF
    doc.save(`receipt-${transaction._id}.pdf`);
  };

  if (loading) {
    return (
      <div className={styles.transactionsLoadingContainer}>
        <div className={styles.transactionsLoadingContent}>
          <div className={styles.transactionsLoadingSpinner}></div>
          <div className={styles.transactionsLoadingTitle}>Loading transactions...</div>
          <div className={styles.transactionsLoadingText}>Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.transactionsMainContainer}>
      {/* Hero Section */}
      <div className={styles.transactionsHero}>
        {/* Dark overlay pattern */}
        <div className={styles.transactionsHeroPattern}></div>
        
        <div className={styles.transactionsHeroContent}>
          <div className={styles.transactionsHeroText}>
            <h1 className={styles.transactionsHeroTitle}>
              Transaction History
            </h1>
            <p className={styles.transactionsHeroSubtitle}>
              View and download your payment history with detailed insights
            </p>
            <div className={styles.transactionsHeroIcons}>
              <div className={styles.transactionsHeroIcon}>
                <span>📊</span>
              </div>
              <div className={styles.transactionsHeroIcon}>
                <span>📄</span>
              </div>
              <div className={styles.transactionsHeroIcon}>
                <span>💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.transactionsMainContent}>
        {/* Stats Cards */}
        <div className={styles.transactionsStatsGrid}>
          <div className={styles.transactionsStatCard}>
            <div className={styles.transactionsStatCardContent}>
              <div className={`${styles.transactionsStatIcon} ${styles.transactionsStatIconBlue}`}>
                <span>📊</span>
              </div>
              <div>
                <p className={styles.transactionsStatLabel}>Total Transactions</p>
                <p className={styles.transactionsStatValue}>{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className={styles.transactionsStatCard}>
            <div className={styles.transactionsStatCardContent}>
              <div className={`${styles.transactionsStatIcon} ${styles.transactionsStatIconGreen}`}>
                <span>✅</span>
              </div>
              <div>
                <p className={styles.transactionsStatLabel}>Completed</p>
                <p className={styles.transactionsStatValue}>{transactions.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </div>

          <div className={styles.transactionsStatCard}>
            <div className={styles.transactionsStatCardContent}>
              <div className={`${styles.transactionsStatIcon} ${styles.transactionsStatIconYellow}`}>
                <span>⏳</span>
              </div>
              <div>
                <p className={styles.transactionsStatLabel}>Pending</p>
                <p className={styles.transactionsStatValue}>{transactions.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className={styles.transactionsStatCard}>
            <div className={styles.transactionsStatCardContent}>
              <div className={`${styles.transactionsStatIcon} ${styles.transactionsStatIconPurple}`}>
                <span>💰</span>
              </div>
              <div>
                <p className={styles.transactionsStatLabel}>Total Amount</p>
                <p className={styles.transactionsStatValue}>Rs. {transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.transactionsSearchSection}>
          <div className={styles.transactionsSearchHeader}>
            <h2 className={styles.transactionsSearchTitle}>📊 Transaction Management</h2>
        {transactions.length > 0 && (
          <button
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(20);
              doc.text('TransportPay Transaction Report', 20, 30);
              doc.setFontSize(12);
              doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
              doc.text(`Total Transactions: ${transactions.length}`, 20, 55);
              
              let yPos = 75;
              transactions.forEach((transaction, index) => {
                if (yPos > 250) {
                  doc.addPage();
                  yPos = 30;
                }
                doc.text(`${index + 1}. ${transaction.transactionType} - Rs. ${transaction.amount.toFixed(2)}`, 20, yPos);
                doc.text(`   Date: ${new Date(transaction.timestamp).toLocaleDateString()}`, 20, yPos + 8);
                yPos += 20;
              });
              
              doc.save('transaction-report.pdf');
            }}
            className={styles.transactionsDownloadButton}
          >
            📄 Download Report
          </button>
        )}
      </div>
      
          <div className={styles.transactionsSearchGrid}>
            <div className={styles.transactionsSearchField}>
              <label className={styles.transactionsSearchLabel}>
                Search Transactions
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by card, type, or status..."
                className={styles.transactionsSearchInput}
              />
            </div>

            <div className={styles.transactionsSearchField}>
              <label className={styles.transactionsSearchLabel}>
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.transactionsSearchSelect}
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="transport_payment">Transport Payment</option>
                <option value="topup">Top-up</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div className={styles.transactionsSearchField}>
              <label className={styles.transactionsSearchLabel}>
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.transactionsSearchSelect}
              >
                <option value="date">Date (Newest)</option>
                <option value="amount">Amount (Highest)</option>
                <option value="type">Type (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      
        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className={styles.transactionsEmptyState}>
            <div className={styles.transactionsEmptyStateIcon}>📊</div>
            <p className={styles.transactionsEmptyStateTitle}>No transactions found</p>
            <p className={styles.transactionsEmptyStateText}>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your transaction history will appear here'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className={styles.transactionsClearFiltersButton}
              >
                Clear Filters
              </button>
            )}
        </div>
      ) : (
          <div className={styles.transactionsTableContainer}>
            <div className={styles.transactionsTableWrapper}>
              <table className={styles.transactionsTable}>
                <thead className={styles.transactionsTableHead}>
                  <tr>
                    <th className={styles.transactionsTableHeader}>Card</th>
                    <th className={styles.transactionsTableHeader}>Amount</th>
                    <th className={styles.transactionsTableHeader}>Type</th>
                    <th className={styles.transactionsTableHeader}>Route</th>
                    <th className={styles.transactionsTableHeader}>Status</th>
                    <th className={styles.transactionsTableHeader}>Date</th>
                    <th className={styles.transactionsTableHeader}>Actions</th>
                </tr>
              </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr 
                      key={transaction._id} 
                      className={styles.transactionsTableRow}
                    >
                      <td className={styles.transactionsTableCell}>
                        <div className={styles.transactionsTableCardInfo}>
                          <div className={styles.transactionsTableCardIcon}>
                            💳
                          </div>
                          <span className={styles.transactionsTableCardNumber}>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                          </span>
                        </div>
                    </td>
                      <td className={styles.transactionsTableCell}>
                      <span className={
                          transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment' 
                            ? styles.transactionsTableAmountNegative 
                            : styles.transactionsTableAmountPositive
                      }>
                        {(transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment') ? '-' : '+'}Rs. {transaction.amount.toFixed(2)}
                      </span>
                    </td>
                      <td className={styles.transactionsTableCell}>
                        <div className={styles.transactionsTableTypeInfo}>
                          <span className={styles.transactionsTableTypeIcon}>
                            {transaction.transactionType === 'transport_payment' ? '🚌' : 
                             transaction.transactionType === 'payment' ? '💳' :
                             transaction.transactionType === 'topup' ? '⬆️' : '↩️'}
                          </span>
                          <span className={styles.transactionsTableTypeText}>
                            {transaction.transactionType === 'transport_payment' ? 'Transport Payment' : 
                             transaction.transactionType === 'payment' ? 'Payment' :
                             transaction.transactionType === 'topup' ? 'Top-up' : 'Refund'}
                          </span>
                        </div>
                    </td>
                      <td className={styles.transactionsTableCell}>
                        {transaction.transactionType === 'transport_payment' && transaction.fromLocation && transaction.toLocation ? (
                          <div className={styles.transactionsTableRouteInfo}>
                            <span className={styles.transactionsTableRouteIcon}>🚌</span>
                            <span className={styles.transactionsTableRouteText}>
                              {getStopName(transaction.fromLocation)} → {getStopName(transaction.toLocation)}
                            </span>
                          </div>
                        ) : (
                          <span className={styles.transactionsTableRouteEmpty}>—</span>
                        )}
                    </td>
                      <td className={styles.transactionsTableCell}>
                        <span className={`${styles.transactionsTableStatus} ${
                          transaction.status === 'completed' ? styles.transactionsTableStatusCompleted :
                          transaction.status === 'pending' ? styles.transactionsTableStatusPending :
                          styles.transactionsTableStatusFailed
                        }`}>
                        {transaction.status}
                      </span>
                    </td>
                      <td className={styles.transactionsTableCell}>
                        <span className={styles.transactionsTableDate}>
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </span>
                    </td>
                      <td className={styles.transactionsTableCell}>
                      <button
                        onClick={() => generatePDF(transaction)}
                        className={styles.transactionsTableActionButton}
                      >
                        📄 PDF
                      </button>
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
  );
}

export default TransactionsPage;

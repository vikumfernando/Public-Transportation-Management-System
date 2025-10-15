import { useState, useEffect } from 'react';
import { api } from '../services/api';
import jsPDF from 'jspdf';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      const transactionsData = await api.getTransactions(testUserId);
      setTransactions(transactionsData);
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
        doc.text(`Route: ${transaction.fromLocation} to ${transaction.toLocation}`, 20, 155);
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
    doc.text('This is a digital receipt for your transaction.', 20, 207);
    
    // Save the PDF
    doc.save(`Transaction.pdf`);
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
          }}>Loading transactions...</div>
          <div style={{
            fontSize: '1.125rem',
            color: '#8CDB66'
          }}>Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#F0EBE8'}}>
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
              Transaction History
            </h1>
            <p style={{fontSize: '1.125rem', marginBottom: '2rem', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'}}>
              View and download your payment history with detailed insights
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
                <span style={{fontSize: '1.5rem'}}>📊</span>
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
                <span style={{fontSize: '1.5rem'}}>📄</span>
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
                <span style={{fontSize: '1.5rem'}}>💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', paddingBottom: '2rem'}}>
        {/* Stats Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{fontSize: '1.25rem', color: 'white'}}>📊</span>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500'}}>Total Transactions</p>
                <p style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0'}}>{transactions.length}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{fontSize: '1.25rem', color: 'white'}}>✅</span>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500'}}>Completed</p>
                <p style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0'}}>{transactions.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <span style={{fontSize: '1.25rem', color: 'white'}}>⏳</span>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500'}}>Pending</p>
                <p style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0'}}>{transactions.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <span style={{fontSize: '1.25rem', color: 'white'}}>💰</span>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500'}}>Total Amount</p>
                <p style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0'}}>Rs. {transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0'}}>📊 Transaction Management</h2>
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
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
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
            📄 Download Report
          </button>
        )}
      </div>
      
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Search Transactions
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by card, type, or status..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: '#f9fafb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: '#f9fafb',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="transport_payment">Transport Payment</option>
                <option value="topup">Top-up</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151'}}>
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: '#f9fafb',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
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
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{fontSize: '4rem', marginBottom: '1rem', color: '#9ca3af'}}>📊</div>
            <p style={{fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>No transactions found</p>
            <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
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
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              >
                Clear Filters
              </button>
            )}
        </div>
      ) : (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead style={{background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'}}>
                  <tr>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Card</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Amount</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Type</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Route</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Status</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Date</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Actions</th>
                </tr>
              </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr 
                      key={transaction._id} 
                      style={{
                        borderBottom: index < filteredTransactions.length - 1 ? '1px solid #e5e7eb' : 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f9fafb 0%, #f0fdf4 100%)';
                        e.currentTarget.style.transform = 'translateX(8px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td style={{padding: '1rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: '500'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            💳
                          </div>
                          <span style={{fontFamily: 'Courier New, monospace'}}>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                          </span>
                        </div>
                    </td>
                      <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                      <span style={{
                          color: transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment' ? '#dc2626' : '#16a34a',
                          fontWeight: '600',
                          fontSize: '1rem'
                      }}>
                        {(transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment') ? '-' : '+'}Rs. {transaction.amount.toFixed(2)}
                      </span>
                    </td>
                      <td style={{padding: '1rem', fontSize: '0.875rem', color: '#1e293b'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <span style={{fontSize: '1rem'}}>
                            {transaction.transactionType === 'transport_payment' ? '🚌' : 
                             transaction.transactionType === 'payment' ? '💳' :
                             transaction.transactionType === 'topup' ? '⬆️' : '↩️'}
                          </span>
                          <span style={{fontWeight: '500'}}>
                            {transaction.transactionType === 'transport_payment' ? 'Transport Payment' : 
                             transaction.transactionType === 'payment' ? 'Payment' :
                             transaction.transactionType === 'topup' ? 'Top-up' : 'Refund'}
                          </span>
                        </div>
                    </td>
                      <td style={{padding: '1rem', fontSize: '0.875rem', color: '#1e293b'}}>
                        {transaction.transactionType === 'transport_payment' && transaction.fromLocation && transaction.toLocation ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <span style={{fontSize: '1rem'}}>🚌</span>
                            <span style={{fontWeight: '500'}}>
                              {transaction.fromLocation} → {transaction.toLocation}
                            </span>
                          </div>
                        ) : (
                          <span style={{color: '#9ca3af', fontStyle: 'italic'}}>—</span>
                        )}
                    </td>
                      <td style={{padding: '1rem'}}>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'white',
                          background: transaction.status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                     transaction.status === 'pending' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                     'linear-gradient(135deg, #ef4444, #dc2626)'
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                      <td style={{padding: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </td>
                      <td style={{padding: '1rem'}}>
                      <button
                        onClick={() => generatePDF(transaction)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                            e.target.style.transform = 'translateY(-2px) scale(1.05)';
                            e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = 'none';
                          }}
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

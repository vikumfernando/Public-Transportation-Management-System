import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

function RefundPage() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [refundTransactions, setRefundTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancelledBooking, setCancelledBooking] = useState(null);
  const [refundData, setRefundData] = useState(null);

  useEffect(() => {
    loadTransactions();

    // Check if we came from a cancelled booking
    if (location.state) {
      if (location.state.cancelledBooking) {
        setCancelledBooking(location.state.cancelledBooking);
        setRefundData(location.state.refundData);
        setMessage(location.state.message || '');
      }
    }
  }, [location.state]);

  const loadTransactions = async () => {
    try {
      const testUserId = "507f1f77bcf86cd799439011";
      const transactionsData = await api.getTransactions(testUserId);
      // Only show payment transactions that can be refunded
      const paymentTransactions = transactionsData.filter(t => t.transactionType === 'payment');
      // Show refund transactions (automatic refunds from cancellations)
      const refundTransactions = transactionsData.filter(t => t.transactionType === 'refund');
      setTransactions(paymentTransactions);
      setRefundTransactions(refundTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  // Filter transactions for display
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleRefund = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await api.processRefund({
        transactionId: selectedTransaction,
        amount: parseFloat(refundAmount),
        reason
      });

      if (result.success) {
        setMessage(`✅ Refund processed successfully! Amount: Rs. ${refundAmount}. You will get refund within 48 hours.`);
        setSelectedTransaction('');
        setRefundAmount('');
        setReason('');
        loadTransactions();
      } else {
        setMessage('❌ Refund failed: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0EBE8' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)', padding: '4rem 0' }}>
        {/* Dark overlay pattern */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          opacity: '0.6'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: '1' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Refund Management
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              Process refunds for completed transactions with ease
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.75rem',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#e2e8f0', margin: '0', textAlign: 'center', fontWeight: '500' }}>
                ⏰ <strong>Refund Processing Time:</strong> You will receive your refund within 48 hours of processing
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
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
                <span style={{ fontSize: '1.5rem' }}>📊</span>
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
                <span style={{ fontSize: '1.5rem' }}>✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Booking Refund Process */}
      {cancelledBooking && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.25rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', color: 'white' }}>✅</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>Refund Process Completed</h2>
            </div>

            {message && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                border: '1px solid #047857',
                marginBottom: '1.5rem'
              }}>
                {message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Booking Details */}
              <div style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>📄 Cancelled Booking Details</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking ID</span>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>{cancelledBooking.bookingId}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bus</span>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                      {cancelledBooking.busId?.vehicleNumber || 'N/A'} ({cancelledBooking.busId?.vehicleType || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seats</span>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                      {Array.isArray(cancelledBooking.seatNumbers) ? cancelledBooking.seatNumbers.join(', ') : cancelledBooking.seatNumbers || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Travel Date</span>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                      {cancelledBooking.travelDate ? new Date(cancelledBooking.travelDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Details */}
              {refundData && (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #bbf7d0'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>💰 Refund Details</h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refund Amount</span>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669', margin: '0.25rem 0 0 0' }}>
                        Rs. {refundData.refundAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Card Balance</span>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                        Rs. {refundData.newBalance?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refund Status</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', margin: '0.25rem 0 0 0' }}>
                        {refundData.success ? '✅ Completed' : '❌ Failed'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Processing Time</span>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', margin: '0.25rem 0 0 0' }}>
                        ⏰ You will get refund within 48 hours
                      </p>
                    </div>
                    {refundData.refundTransactionId && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction ID</span>
                        <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                          {refundData.refundTransactionId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', color: 'white' }}>💰</span>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500' }}>Refundable Transactions</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>{transactions.length}</p>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <span style={{ fontSize: '1.25rem', color: 'white' }}>✅</span>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500' }}>Completed</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>{transactions.filter(t => t.status === 'completed').length}</p>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <span style={{ fontSize: '1.25rem', color: 'white' }}>💳</span>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500' }}>Total Refundable</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>Rs. {transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <span style={{ fontSize: '1.25rem', color: 'white' }}>🔄</span>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500' }}>Auto Refunds</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>{refundTransactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Automatic Refunds Section */}
        {refundTransactions.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.25rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', color: 'white' }}>🔄</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>Automatic Refunds from Cancellations</h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {refundTransactions.slice(0, 5).map((refund) => (
                <div
                  key={refund._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    borderRadius: '0.75rem',
                    border: '1px solid #bbf7d0',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      🔄
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                        {refund.cardNumber.length > 12
                          ? '**** **** **** ' + refund.cardNumber.slice(-4)
                          : 'Card #' + refund.cardNumber
                        }
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0' }}>
                        {new Date(refund.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {refund.meta?.refundReason && (
                        <p style={{ fontSize: '0.75rem', color: '#059669', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
                          Reason: {refund.meta.refundReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', color: '#059669', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                      +Rs. {refund.amount.toFixed(2)}
                    </p>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'white',
                      background: 'linear-gradient(135deg, #10b981, #059669)'
                    }}>
                      {refund.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Refund Form */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', color: 'white' }}>💰</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>Process Refund</h2>
            </div>

            <form onSubmit={handleRefund} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Select Transaction
                </label>
                <select
                  value={selectedTransaction}
                  onChange={(e) => setSelectedTransaction(e.target.value)}
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
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                >
                  <option value="">Choose a transaction</option>
                  {transactions.map((transaction) => (
                    <option key={transaction._id} value={transaction._id}>
                      {transaction.cardNumber.length > 12
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      } - Rs. {transaction.amount.toFixed(2)} - {new Date(transaction.timestamp).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
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
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter refund amount"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Reason for Refund
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#f9fafb',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter reason for refund"
                  rows="3"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Processing Refund...
                  </>
                ) : (
                  <>
                    💰 Process Refund
                  </>
                )}
              </button>
            </form>

            {message && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'white',
                background: message.includes('✅') ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', color: 'white' }}>📊</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>Available Transactions</h2>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Search Transactions
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by card or status..."
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
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
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#9ca3af' }}>💰</div>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  {searchTerm || filterStatus !== 'all' ? 'No matching transactions' : 'No transactions available for refund'}
                </p>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Complete some payments first to see them here'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
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
              <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredTransactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f0fdf4 100%)',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)';
                      e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f9fafb 0%, #f0fdf4 100%)';
                      e.currentTarget.style.transform = 'translateX(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    onClick={() => {
                      setSelectedTransaction(transaction._id);
                      setRefundAmount(transaction.amount.toString());
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        💳
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                          {transaction.cardNumber.length > 12
                            ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                            : 'Card #' + transaction.cardNumber
                          }
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0' }}>
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: '#dc2626', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                        -Rs. {transaction.amount.toFixed(2)}
                      </p>
                      <span style={{
                        padding: '0.25rem 0.5rem',
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundPage;

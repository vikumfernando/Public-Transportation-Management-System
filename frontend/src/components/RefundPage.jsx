import { useState, useEffect } from 'react';
import { api } from '../services/api';

function RefundPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const testUserId = "507f1f77bcf86cd799439011";
      const transactionsData = await api.getTransactions(testUserId);
      // Only show payment transactions that can be refunded
      const paymentTransactions = transactionsData.filter(t => t.transactionType === 'payment');
      setTransactions(paymentTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

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
        setMessage(`✅ Refund processed successfully! Amount: Rs. ${refundAmount}`);
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
    <div className="min-h-screen" style={{backgroundColor: '#F0EBE8'}}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-8xl">💰</div>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{color: '#0B5648'}}>
              Refund Management
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              Process refunds for completed transactions
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#0B5648'}}>💰 Refund Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Refund Form */}
        <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>Process Refund</h2>
          <form onSubmit={handleRefund} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Select Transaction
              </label>
              <select
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                required
              >
                <option value="">Choose a transaction</option>
                {transactions.map((transaction) => (
                  <option key={transaction._id} value={transaction._id}>
                    {transaction.cardNumber.length > 12 
                      ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                      : 'Card #' + transaction.cardNumber
                    } - ${transaction.amount.toFixed(2)} - {new Date(transaction.timestamp).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Refund Amount
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                placeholder="Enter refund amount"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#0B5648'}}>
                Reason for Refund
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300"
                style={{borderColor: '#8CDB66'}}
                placeholder="Enter reason for refund"
                rows="3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 hover:shadow-lg font-semibold"
              style={{backgroundColor: '#FF6B6B'}}
              onMouseOver={(e) => e.target.style.backgroundColor = '#FF5252'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#FF6B6B'}
            >
              {loading ? 'Processing Refund...' : 'Process Refund'}
            </button>
          </form>
          
          {message && (
            <div className="mt-4 p-3 rounded-md text-sm text-white" style={{
              backgroundColor: message.includes('✅') ? '#8CDB66' : '#FF6B6B'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#0B5648'}}>Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>💰</div>
              <p className="text-xl" style={{color: '#0B5648'}}>No transactions available for refund</p>
              <p style={{color: '#8CDB66'}}>Complete some payments first</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex justify-between items-center p-3 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#F0EBE8'}}>
                  <div>
                    <p className="font-medium" style={{color: '#0B5648'}}>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                    </p>
                    <p className="text-sm" style={{color: '#8CDB66'}}>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{color: '#FF6B6B'}}>-Rs. {transaction.amount.toFixed(2)}</p>
                    <p className="text-xs" style={{color: '#0B5648'}}>{transaction.transactionType}</p>
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

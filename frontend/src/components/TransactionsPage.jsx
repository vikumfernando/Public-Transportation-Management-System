import { useState, useEffect } from 'react';
import { api } from '../services/api';
import jsPDF from 'jspdf';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        doc.text(`Route: ${transaction.fromLocation} → ${transaction.toLocation}`, 20, 155);
      }
      if (transaction.distance) {
        doc.text(`Distance: ${transaction.distance} km`, 20, 165);
      }
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for using TransportPay!', 20, 180);
    doc.text('This is a digital receipt.', 20, 187);
    
    // Save the PDF
    doc.save(`receipt-${transaction._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading transactions...</div>
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
              <div className="text-8xl">📊</div>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{color: '#0B5648'}}>
              Transaction History
            </h1>
            <p className="text-xl mb-8" style={{color: '#8CDB66'}}>
              View and download your payment history
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl">📄</span>
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
          <h2 className="text-3xl font-bold" style={{color: '#0B5648'}}>📊 Your Transactions</h2>
        {transactions.length > 0 && (
          <button
            onClick={() => {
              // Generate PDF for all transactions
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
            className="text-white px-4 py-2 rounded-md transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
            style={{backgroundColor: '#0B5648'}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#8CDB66'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0B5648'}
          >
            📄 Download Report
          </button>
        )}
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{color: '#8CDB66'}}>📊</div>
          <p className="text-xl" style={{color: '#0B5648'}}>No transactions found</p>
          <p style={{color: '#8CDB66'}}>Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl" style={{backgroundColor: '#FFFFFF'}}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{backgroundColor: '#F0EBE8'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{color: '#0B5648'}}>Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="transform hover:scale-105 transition-all duration-300 hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {transaction.cardNumber.length > 12 
                        ? '**** **** **** ' + transaction.cardNumber.slice(-4)
                        : 'Card #' + transaction.cardNumber
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span style={{
                        color: transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment' ? '#FF6B6B' : '#8CDB66'
                      }}>
                        {(transaction.transactionType === 'payment' || transaction.transactionType === 'transport_payment') ? '-' : '+'}Rs. {transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {transaction.transactionType === 'transport_payment' ? '🚌 Transport Payment' : transaction.transactionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs text-white" style={{
                        backgroundColor: transaction.status === 'completed' ? '#8CDB66' :
                        transaction.status === 'pending' ? '#FFA726' :
                        '#FF6B6B'
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#0B5648'}}>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => generatePDF(transaction)}
                        className="font-medium transform hover:scale-110 transition-all duration-300 hover:shadow-lg px-2 py-1 rounded"
                        style={{color: '#0B5648'}}
                        onMouseOver={(e) => e.target.style.color = '#8CDB66'}
                        onMouseOut={(e) => e.target.style.color = '#0B5648'}
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

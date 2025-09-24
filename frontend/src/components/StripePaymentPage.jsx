import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../services/api';

// Stripe Payment Form Component
function StripePaymentForm({ amount, visaCardId, nfcCardId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create payment intent with database cards
      const { clientSecret, paymentIntentId } = await api.createPaymentIntent({
        amount: amount,
        visaCardId: visaCardId,
        nfcCardId: nfcCardId,
        userId: "507f1f77bcf86cd799439011"
      });

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        setMessage(`❌ Payment failed: ${error.message}`);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        const result = await api.confirmPayment({
          paymentIntentId: paymentIntentId,
          visaCardId: visaCardId,
          nfcCardId: nfcCardId,
          userId: "507f1f77bcf86cd799439011",
          amount: amount
        });

        if (result.success) {
          setMessage(`✅ Recharge successful! NFC balance: Rs. ${result.nfcCardBalance.toFixed(2)}`);
          onSuccess(result);
        } else {
          setMessage(`❌ Backend confirmation failed: ${result.error}`);
          onError(result.error);
        }
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="text-center">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : `Pay Rs. ${amount.toFixed(2)}`}
        </button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}

// Main Stripe Payment Page
function StripePaymentPage() {
  const [stripePromise, setStripePromise] = useState(null);
  const [amount, setAmount] = useState('');
  const [visaCardId, setVisaCardId] = useState('');
  const [nfcCardId, setNfcCardId] = useState('');
  const [visaCards, setVisaCards] = useState([]);
  const [nfcCards, setNfcCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStripeConfig();
    loadCards();
  }, []);

  const loadStripeConfig = async () => {
    try {
      const config = await api.getStripeConfig();
      const stripe = await loadStripe(config.publishableKey);
      setStripePromise(stripe);
    } catch (error) {
      console.error('Error loading Stripe config:', error);
    }
  };

  const loadCards = async () => {
    try {
      setLoading(true);
      const testUserId = "507f1f77bcf86cd799439011";
      
      // Load both Visa and NFC cards separately
      const [visaCardsData, nfcCardsData] = await Promise.all([
        api.getVisaCards(testUserId),
        api.getSmartCards(testUserId)
      ]);
      
      setVisaCards(visaCardsData);
      setNfcCards(nfcCardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    // Reload cards to show updated balance
    loadCards();
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading payment system...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">💳 Stripe Payment</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Visa Card (Source)
              </label>
              <select
                value={visaCardId}
                onChange={(e) => setVisaCardId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose Visa card</option>
                {visaCards.map((card) => (
                  <option key={card._id} value={card.cardNumber}>
                    **** **** **** {card.cardNumber.slice(-4)} - Rs. {card.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select NFC Card (Destination)
              </label>
              <select
                value={nfcCardId}
                onChange={(e) => setNfcCardId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (Rs.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            {stripePromise && amount && visaCardId && nfcCardId && (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={parseFloat(amount)}
                  visaCardId={visaCardId}
                  nfcCardId={nfcCardId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* Card Information */}
        <div className="space-y-6">
          {/* Visa Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">💳 Visa Cards</h2>
            
            {visaCards.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-400 text-2xl mb-2">💳</div>
                <p className="text-gray-500">No Visa cards found</p>
                <p className="text-gray-400 text-sm">Add Visa cards first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visaCards.map((card) => (
                  <div key={card._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          **** **** **** {card.cardNumber.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-500">{card.cardHolderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Rs. {card.balance.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NFC Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📱 NFC Cards</h2>
            
            {nfcCards.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-400 text-2xl mb-2">📱</div>
                <p className="text-gray-500">No NFC cards found</p>
                <p className="text-gray-400 text-sm">Add NFC cards first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nfcCards.map((card) => (
                  <div key={card._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          Card #{card.cardNumber}
                        </p>
                        <p className="text-sm text-gray-500">{card.cardType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Rs. {card.balance.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Balance</p>
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
  );
}

export default StripePaymentPage;

const API_BASE_URL = 'http://localhost:8070/api';

export const api = {
  // Smart Cards
  getSmartCards: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/smart-cards/${userId}`);
    return response.json();
  },

  addSmartCard: async (cardData) => {
    const response = await fetch(`${API_BASE_URL}/smart-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  updateSmartCard: async (cardId, cardData) => {
    const response = await fetch(`${API_BASE_URL}/smart-cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  deleteSmartCard: async (cardId) => {
    const response = await fetch(`${API_BASE_URL}/smart-cards/${cardId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Visa Cards
  getVisaCards: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/visa-cards/${userId}`);
    return response.json();
  },

  addVisaCard: async (cardData) => {
    const response = await fetch(`${API_BASE_URL}/visa-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  updateVisaCard: async (cardId, cardData) => {
    const response = await fetch(`${API_BASE_URL}/visa-cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  deleteVisaCard: async (cardId) => {
    const response = await fetch(`${API_BASE_URL}/visa-cards/${cardId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Routes
  getRoutes: async () => {
    const response = await fetch(`${API_BASE_URL}/routes`);
    return response.json();
  },

  addRoute: async (routeData) => {
    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routeData),
    });
    return response.json();
  },

  // Fare Calculation
  calculateFare: async (routeId, distance) => {
    const response = await fetch(`${API_BASE_URL}/calculate-fare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routeId, distance }),
    });
    return response.json();
  },

  // Payments
  makePayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  // Topup
  topupCard: async (topupData) => {
    const response = await fetch(`${API_BASE_URL}/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topupData),
    });
    return response.json();
  },

  // Transactions
  getTransactions: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${userId}`);
    return response.json();
  },

  // Refunds
  processRefund: async (refundData) => {
    const response = await fetch(`${API_BASE_URL}/refunds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refundData),
    });
    return response.json();
  },

  // Revenue
  getRevenueByRoute: async (routeId, period = 'daily') => {
    const response = await fetch(`${API_BASE_URL}/revenue/route/${routeId}?period=${period}`);
    return response.json();
  },

  getOverallRevenue: async (period = 'daily') => {
    const response = await fetch(`${API_BASE_URL}/revenue/overall?period=${period}`);
    return response.json();
  },

  // Initialize sample data
  initSampleData: async () => {
    const response = await fetch(`${API_BASE_URL}/init-sample-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // ==================== STRIPE PAYMENTS ====================
  
  // Get Stripe configuration
  getStripeConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/stripe/config`);
    return response.json();
  },

  // Create Stripe payment intent
  createPaymentIntent: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },

  // Confirm Stripe payment
  confirmPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/stripe/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },

  // ==================== CARD BALANCE MANAGEMENT ====================
  
  // Update card balance (for recharge functionality)
  updateCardBalance: async (cardNumber, amount) => {
    const response = await fetch(`${API_BASE_URL}/cards/update-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumber, amount })
    });
    return response.json();
  },

  // Add transaction record
  addTransaction: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  },

  // ==================== ROUTE MANAGEMENT ====================
  
  // Get route by route number
  getRouteByNumber: async (routeNumber) => {
    const response = await fetch(`${API_BASE_URL}/routes/number/${routeNumber}`);
    return response.json();
  },

  // Get all routes
  getAllRoutes: async () => {
    const response = await fetch(`${API_BASE_URL}/routes`);
    return response.json();
  },

  // Initialize sample routes
  initSampleRoutes: async () => {
    const response = await fetch(`${API_BASE_URL}/routes/init-sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },
};
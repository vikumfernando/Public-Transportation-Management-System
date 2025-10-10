const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { Server } = require("socket.io"); //new
const http = require("http");

const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8070;

app.use(cors());
app.use(express.json());

const server = http.createServer(app); //new

const URL = process.env.MONGODB_URL;

const io = new Server(server, {
  cors: { origin: "*" } // new
});

// Initialize Stripe after loading environment variables with Sample Data check
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key_here')) {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } else {
    console.log('💡 Stripe demo mode - system works without real payments');
    stripe = null;
  }
} catch (error) {
  console.log('⚠️ Stripe initialization failed:', error.message);
  stripe = null;
}

app.set("io", io);

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB connection established successfully");
})


//Add routes here later

const busStopRouter = require("./routes/RouteManagement/Stops.js");
const busRouter = require("./routes/RouteManagement/Busses.js");
const routesRouter = require("./routes/RouteManagement/Routes.js");
const schedulesRouter = require("./routes/RouteManagement/Schedules.js");
const authRouter = require("./routes/auth.js");
const usersRouter = require("./routes/users.js");

//const User = mongoose.model('User', userSchema);
<<<<<<< HEAD

=======
const SmartCard = mongoose.model('SmartCard', smartCardSchema);
const VisaCard = mongoose.model('VisaCard', visaCardSchema);
//const Route = mongoose.model('Route', routeSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
>>>>>>> 8e40df1d54a25b9a906e1eef34d6f4d09cd74a55

app.use("/Stops", busStopRouter);
app.use("/Busses", busRouter);
app.use("/Routes", routesRouter);
app.use("/Schedules", schedulesRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Transportation Management System API",
    status: "running",
    features: [
      "NFC Smart Cards",
      "Visa Cards", 
      "Digital Receipts",
      "Fare Calculation",
      "Revenue Management",
      "Refund System"
    ]
  });
});

app.get("/api/smart-cards/:userId", async (req, res) => {
  try {
    // For demo purposes, return all smart cards
    const cards = await SmartCard.find({ isActive: true });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/smart-cards", async (req, res) => {
  try {
    const { cardNumber, userId, balance, cardType } = req.body;
    const card = new SmartCard({ cardNumber, userId, balance, cardType });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update smart card
app.put("/api/smart-cards/:id", async (req, res) => {
  try {
    const { cardNumber, balance, cardType } = req.body;
    const card = await SmartCard.findByIdAndUpdate(
      req.params.id,
      { cardNumber, balance, cardType },
      { new: true }
    );
    if (!card) {
      return res.status(404).json({ error: "Smart card not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete smart card
app.delete("/api/smart-cards/:id", async (req, res) => {
  try {
    const card = await SmartCard.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ error: "Smart card not found" });
    }
    res.json({ message: "Smart card deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's visa cards
app.get("/api/visa-cards/:userId", async (req, res) => {
  try {
    // For demo purposes, return all visa cards
    const cards = await VisaCard.find({ isActive: true });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add visa card
app.post("/api/visa-cards", async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryDate, cvv, userId, balance } = req.body;
    const card = new VisaCard({ cardNumber, cardHolderName, expiryDate, cvv, userId, balance });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Visa card
app.put("/api/visa-cards/:id", async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryDate, cvv, balance } = req.body;
    const card = await VisaCard.findByIdAndUpdate(
      req.params.id,
      { cardNumber, cardHolderName, expiryDate, cvv, balance },
      { new: true, runValidators: true }
    );
    
    if (!card) {
      return res.status(404).json({ error: "Visa card not found" });
    }
    
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Visa card
app.delete("/api/visa-cards/:id", async (req, res) => {
  try {
    const card = await VisaCard.findByIdAndDelete(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: "Visa card not found" });
    }
    
    res.json({ message: "Visa card deleted successfully", card });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all routes
app.get("/api/routes", async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get route by routeNumber
app.get("/api/routes/number/:routeNumber", async (req, res) => {
  try {
    const routeNumber = parseInt(req.params.routeNumber);
    const route = await Route.findOne({ routeNum: routeNumber });
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate fare
app.post("/api/calculate-fare", async (req, res) => {
  try {
    const { routeId, distance } = req.body;
    const route = await Route.findById(routeId);
    
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    
    const fare = route.baseFare + (distance * route.farePerKm);
    res.json({ fare, route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process payment
app.post("/api/payments", async (req, res) => {
  try {
    const { cardNumber, amount, userId, routeId, distance } = req.body;
    
    // Determine card type and find card
    let card, cardType;
    
    if (cardNumber.length > 12) {
      // Visa card
      cardType = 'Visa';
      card = await VisaCard.findOne({ cardNumber, isActive: true });
    } else {
      // Smart card
      cardType = 'NFC';
      card = await SmartCard.findOne({ cardNumber, isActive: true });
    }
    
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    if (card.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // Update card balance
    card.balance -= amount;
    await card.save();
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      cardNumber,
      cardType,
      amount,
      transactionType: 'payment',
      routeId,
      distance,
      fare: amount
    });
    
    await transaction.save();
    
    
    
    res.json({ 
      success: true, 
      newBalance: card.balance, 
      transaction,
      receiptSent: transaction.receiptSent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    // For demo purposes, return all transactions if userId is the demo user
    let query = { userId: req.params.userId };
    if (req.params.userId === "507f1f77bcf86cd799439011") {
      // Return all transactions for demo user
      query = {};
    }
    
    const transactions = await Transaction.find(query)
      .populate('routeId')
      .sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top up card
app.post("/api/topup", async (req, res) => {
  try {
    const { cardNumber, amount, userId } = req.body;
    
    let card, cardType;
    if (cardNumber.length > 12) {
      cardType = 'Visa';
      card = await VisaCard.findOne({ cardNumber, isActive: true });
    } else {
      cardType = 'NFC';
      card = await SmartCard.findOne({ cardNumber, isActive: true });
    }
    
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    card.balance += amount;
    await card.save();
    
    const transaction = new Transaction({
      userId,
      cardNumber,
      cardType,
      amount,
      transactionType: 'topup'
    });
    
    await transaction.save();
    
    res.json({ success: true, newBalance: card.balance, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe Payment Intent (Demo Mode - No Real Stripe)
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'lkr', visaCardId, nfcCardId } = req.body;
    
    // Check if Visa card exists and has sufficient balance
    const visaCard = await VisaCard.findOne({ cardNumber: visaCardId });
    if (!visaCard) {
      return res.status(404).json({ error: 'Visa card not found' });
    }
    
    if (visaCard.balance < amount) {
      return res.status(400).json({ error: `Insufficient balance. Available: Rs. ${visaCard.balance.toFixed(2)}` });
    }
    
    // Check if NFC card exists
    const nfcCard = await SmartCard.findOne({ cardNumber: nfcCardId });
    if (!nfcCard) {
      return res.status(404).json({ error: 'NFC card not found' });
    }
    
    // Demo mode - simulate Stripe response
    const mockPaymentIntent = {
      id: 'pi_demo_' + Date.now(),
      client_secret: 'pi_demo_' + Date.now() + '_secret_demo',
      status: 'requires_payment_method'
    };

    res.json({
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
      demoMode: true
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Stripe Payment (Demo Mode)
app.post('/api/stripe/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, visaCardId, nfcCardId, userId, amount } = req.body;
    
    // Demo mode - simulate successful payment
    const isDemoMode = paymentIntentId.startsWith('pi_demo_');
    
    if (isDemoMode || true) { // Always succeed in demo mode
      // Get cards from database
      const visaCard = await VisaCard.findOne({ cardNumber: visaCardId });
      const nfcCard = await SmartCard.findOne({ cardNumber: nfcCardId });
      
      if (!visaCard) {
        return res.status(404).json({ error: 'Visa card not found' });
      }
      
      if (!nfcCard) {
        return res.status(404).json({ error: 'NFC card not found' });
      }
      
      // Transfer money: deduct from Visa, add to NFC
      visaCard.balance -= amount;
      nfcCard.balance += amount;
      
      await visaCard.save();
      await nfcCard.save();
      
      // Create transaction record
      const transaction = new Transaction({
        userId: "507f1f77bcf86cd799439011", // Demo user ID for testing
        cardNumber: nfcCardId,
        amount: amount,
        transactionType: 'recharge',
        status: 'completed',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId,
        sourceCard: visaCardId
      });
      await transaction.save();
      
      // Email functionality removed - receipts available via PDF download
      
      res.json({
        success: true,
        message: 'Recharge successful',
        transactionId: transaction._id,
        visaCardBalance: visaCard.balance,
        nfcCardBalance: nfcCard.balance
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Stripe Payment Confirmation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Stripe Publishable Key
app.get('/api/stripe/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Debug endpoint to list all cards
app.get('/api/debug/cards', async (req, res) => {
  try {
    const [visaCards, smartCards] = await Promise.all([
      VisaCard.find({}),
      SmartCard.find({})
    ]);
    
    res.json({
      visaCards: visaCards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        cardHolderName: card.cardHolderName,
        balance: card.balance,
        isActive: card.isActive
      })),
      smartCards: smartCards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        cardType: card.cardType,
        balance: card.balance,
        isActive: card.isActive
      })),
      total: visaCards.length + smartCards.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update card balance
app.post('/api/cards/update-balance', async (req, res) => {
  try {
    const { cardNumber, amount } = req.body;
    
    // Determine if it's a Visa card or Smart card
    const Card = cardNumber.startsWith('4') ? VisaCard : SmartCard;
    const card = await Card.findOne({ cardNumber });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update balance
    card.balance += amount;
    await card.save();
    
    res.json({
      success: true,
      card: card,
      cardNumber: card.cardNumber,
      balance: card.balance,
      message: `Balance updated by Rs. ${amount.toFixed(2)}`
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction record
app.post('/api/transactions', async (req, res) => {
  try {
    const { 
      cardNumber, 
      amount, 
      transactionType, 
      status, 
      paymentMethod, 
      sourceCard,
      fromLocation,
      toLocation,
      distance
    } = req.body;
    
    console.log('📝 Recording transaction:', {
      cardNumber,
      amount,
      transactionType,
      fromLocation,
      toLocation,
      distance
    });
    
    const transaction = new Transaction({
      userId: "507f1f77bcf86cd799439011", // Demo user ID for testing
      cardNumber,
      amount,
      transactionType,
      status,
      paymentMethod,
      sourceCard,
      fromLocation,
      toLocation,
      distance,
      timestamp: new Date()
    });
    
    await transaction.save();
    console.log('✅ Transaction saved with ID:', transaction._id);
    
    res.json({
      success: true,
      transaction: transaction,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});


//changed from app to server
server.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});
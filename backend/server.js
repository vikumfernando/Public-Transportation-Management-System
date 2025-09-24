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



// Smart Card Schema (NFC)
const smartCardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  cardType: { type: String, default: 'NFC', enum: ['NFC', 'RFID'] },
  createdAt: { type: Date, default: Date.now }
});

// Visa Card Schema
const visaCardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true, unique: true },
  cardHolderName: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvv: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  cardType: { type: String, default: 'Visa' },
  createdAt: { type: Date, default: Date.now }
});

// Route Schema
const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  distance: { type: Number, required: true }, // in km
  baseFare: { type: Number, required: true },
  farePerKm: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cardNumber: { type: String, required: true },
  cardType: { type: String, required: false, enum: ['NFC', 'RFID', 'Visa'], default: 'NFC' },
  amount: { type: Number, required: true },
  transactionType: { type: String, required: true, enum: ['payment', 'topup', 'refund', 'transport_payment'] },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  distance: { type: Number },
  fare: { type: Number },
  status: { type: String, default: 'completed', enum: ['pending', 'completed', 'failed', 'refunded'] },
  timestamp: { type: Date, default: Date.now },
  // For transport payments
  fromLocation: { type: String },
  toLocation: { type: String },
  paymentMethod: { type: String, default: 'nfc_card' },
  sourceCard: { type: String }
});

//Add routes here later

const busStopRouter = require("./routes/Stops.js");
const busRouter = require("./routes/Busses.js");
const routesRouter = require("./routes/Routes.js");
const schedulesRouter = require("./routes/Schedules.js");
const authRouter = require("./routes/auth.js");
const usersRouter = require("./routes/users.js");


app.use("/Stops", busStopRouter);
app.use("/Busses", busRouter);
app.use("/Routes", routesRouter);
app.use("/Schedules", schedulesRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);



//changed from app to server
server.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});
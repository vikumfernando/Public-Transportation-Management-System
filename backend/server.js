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
const seatBooking = require("./routes/Bookings.js");
const busDetailsRoutes = require("./routes/BusDetails.js");
const searchRoutes = require("./routes/BusSeach.js");

const cardsRouter = require("./routes/cards.js");
const paymentsRouter = require("./routes/Payments.js");
const transactionRouter = require("./routes/transaction.js");
const revenueRouter = require("./routes/revenue.js");

//const User = mongoose.model('User', userSchema);
const SmartCard = mongoose.model('SmartCard', smartCardSchema);
const VisaCard = mongoose.model('VisaCard', visaCardSchema);
//const Route = mongoose.model('Route', routeSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

app.use("/Stops", busStopRouter);
app.use("/Busses", busRouter);
app.use("/Routes", routesRouter);
app.use("/Schedules", schedulesRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/Bookings", seatBooking);
app.use("/BusSearch", searchRoutes);
app.use("/BusDetails", busDetailsRoutes);


app.use("/api/transactions", transactionRouter);
app.use("/api", cardsRouter); // exposes /smart-cards, /visa-cards, /cards/update-balance
app.use("/api", paymentsRouter); // exposes /payments aliases and stripe, calculate-fare
app.use("/api", routesRouter); // exposes /routes endpoints
app.use("/api/revenue", revenueRouter);

// Health check - now handled by Routes.js
app.get("/", (req, res) => {
  res.redirect("/Routes/health");
});



//changed from app to server
server.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});
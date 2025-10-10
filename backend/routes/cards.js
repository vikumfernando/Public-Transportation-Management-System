const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const SmartCard = require('../models/SmartCard');
const VisaCard = require('../models/VisaCard');

// Device-only tap route (for IoT NFC readers)
router.post("/tap", cardController.handleTap);

// Card routes
router.get("/", cardController.getUserCards);
router.post("/", cardController.createCard);
router.get("/balance/:cardId", cardController.getCardBalance);
router.post("/topup", cardController.topUpCard);
router.put("/block/:cardId", cardController.blockCard);

// Smart Cards API
router.get("/smart-cards/:userId", async (req, res) => {
  try {
    const cards = await SmartCard.find({ isActive: true });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/smart-cards", async (req, res) => {
  try {
    const { cardNumber, userId, balance, cardType } = req.body;
    const card = new SmartCard({ 
      cardNumber, 
      cardId: cardNumber, // Use cardNumber as cardId for NFC compatibility
      userId, 
      balance, 
      balanceCents: balance * 100, // Convert to cents
      cardType,
      isActive: true,
      status: 'active'
    });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/smart-cards/:id", async (req, res) => {
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

router.delete("/smart-cards/:id", async (req, res) => {
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

// Visa Cards API
router.get("/visa-cards/:userId", async (req, res) => {
  try {
    const cards = await VisaCard.find({ isActive: true });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/visa-cards", async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryDate, cvv, userId, balance } = req.body;
    const card = new VisaCard({ cardNumber, cardHolderName, expiryDate, cvv, userId, balance });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/visa-cards/:id", async (req, res) => {
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

router.delete("/visa-cards/:id", async (req, res) => {
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

// Update card balance
router.post("/update-balance", async (req, res) => {
  try {
    const { cardNumber, amount } = req.body;
    
    const Card = cardNumber.startsWith('4') ? VisaCard : SmartCard;
    const card = await Card.findOne({ cardNumber });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
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

// Debug endpoint to list all cards
router.get("/debug", async (req, res) => {
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

module.exports = router;

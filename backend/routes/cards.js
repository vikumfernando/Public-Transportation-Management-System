const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const SmartCard = require('../models/NFCCard');
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
      userId, 
      balance, 
      cardType,
      isActive: true
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
    const { cardNumber, cardHolderName, expiryDate, cvv, userId, bank, balance } = req.body;
    const card = new VisaCard({ 
      cardNumber, 
      cardHolderName, 
      expiryDate, 
      cvv, 
      userId, 
      bank, 
      balance: balance !== undefined && balance !== null ? Number(balance) : 0
    });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/visa-cards/:id", async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryDate, cvv, bank, balance } = req.body;
    const card = await VisaCard.findByIdAndUpdate(
      req.params.id,
      { 
        cardNumber, 
        cardHolderName, 
        expiryDate, 
        cvv, 
        bank, 
        balance: balance !== undefined && balance !== null ? Number(balance) : 0
      },
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
    
    console.log('🔍 Backend Debug - update-balance called with:', { cardNumber, amount });
    
    // Determine which model to use based on card number format
    let Card, card;
    
    if (cardNumber.length === 16) {
      // Visa card (16 digits starting with 4)
      //console.log('🔍 Backend Debug - Detected Visa card');
      Card = VisaCard;
      card = await Card.findOne({ cardNumber });
    } else if (cardNumber.length >= 8 && cardNumber.length <= 12) {
      // NFC card (8-12 digits)
      //console.log('🔍 Backend Debug - Detected NFC card');
      Card = SmartCard; // This is actually NFCCard
      card = await Card.findOne({ cardNumber });
    } else {
      //console.log('🔍 Backend Debug - Unknown card format:', cardNumber);
      return res.status(400).json({ error: 'Invalid card number format' });
    }
    
   // console.log('🔍 Backend Debug - Found card:', card);
    
    if (!card) {
     // console.log('🔍 Backend Debug - Card not found in database');
      return res.status(404).json({ error: 'Card not found' });
    }
    
    card.balance += amount;
    await card.save();
    
    //console.log('🔍 Backend Debug - Card updated successfully');
    
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
    //console.log('🔍 Debug endpoint called - fetching all cards');
    
    const [visaCards, smartCards] = await Promise.all([
      VisaCard.find({}),
      SmartCard.find({})
    ]);
    
    //console.log('🔍 Debug - Found Visa cards:', visaCards.length);
    //console.log('🔍 Debug - Found Smart/NFC cards:', smartCards.length);
    
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

// Test endpoint to check specific card
router.post("/test-card", async (req, res) => {
  try {
    const { cardNumber } = req.body;
    //console.log('🔍 Test endpoint - checking card:', cardNumber);
    
    // Check both models
    const visaCard = await VisaCard.findOne({ cardNumber });
    const nfcCard = await SmartCard.findOne({ cardNumber });
    
    
    
    res.json({
      cardNumber,
      visaCardFound: !!visaCard,
      nfcCardFound: !!nfcCard,
      visaCard: visaCard ? {
        _id: visaCard._id,
        cardNumber: visaCard.cardNumber,
        balance: visaCard.balance,
        isActive: visaCard.isActive
      } : null,
      nfcCard: nfcCard ? {
        _id: nfcCard._id,
        cardNumber: nfcCard.cardNumber,
        balance: nfcCard.balance,
        isActive: nfcCard.isActive
      } : null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quick debug endpoint to see what's in database
router.get("/debug-cards", async (req, res) => {
  try {
    const [visaCards, nfcCards] = await Promise.all([
      VisaCard.find({}),
      SmartCard.find({}) // This is actually NFCCard
    ]);
    
    res.json({
      visaCards: visaCards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        balance: card.balance,
        isActive: card.isActive
      })),
      nfcCards: nfcCards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        balance: card.balance,
        isActive: card.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

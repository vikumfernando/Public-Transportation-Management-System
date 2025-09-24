const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// Device-only tap route (for IoT NFC readers)
router.post("/tap", deviceAuth, cardController.handleTap);

// All other card routes require user authentication
router.use(auth);

// Card routes
router.get("/", cardController.getUserCards);
router.post("/", cardController.createCard);
router.get("/balance/:cardId", cardController.getCardBalance);
router.post("/topup", cardController.topUpCard);
router.put("/block/:cardId", cardController.blockCard);

module.exports = router;

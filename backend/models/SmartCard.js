const mongoose = require('mongoose');

const smartCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true, index: true }, // NFC UID
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  balanceCents: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked', 'lost'], default: 'active' },
  issuedAt: { type: Date, default: Date.now },
  lastTapAt: { type: Date },
});

module.exports = mongoose.model('SmartCard', smartCardSchema);
const mongoose = require('mongoose');

const fareRuleSchema = new mongoose.Schema({
  name: { type: String, default: 'default' },
  baseFareCents: { type: Number, default: 200 }, // 2.00 base
  perKmCents: { type: Number, default: 100 }, // 1.00 per km
  maxFareCents: { type: Number, default: 1000 },
  freeTransferMinutes: { type: Number, default: 30 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FareRule', fareRuleSchema);
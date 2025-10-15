const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const busSchema = new Schema({
  vehicleNumber: {
    type: String,
    required: true,
  },

  vehicleType: {
    type: String,
    required: true,
  },

  avlSeats: {
    type: Number,
    default: 60,
  },

  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
  },

  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },

  status: {
    type: String,
    default: "Ontime",
  },

  lat: {
    type: Number,
    default: 0,
  },

  lon: {
    type: Number,
    default: 0,
  },

  nextStopIndex: {
    type: Number,
    default: 0,
  },

  activeStatus: {
    type: String,
    default: "On duty",
  },

  busImage: {
    type: String,
    required: true,
    default : "https://imgur.com/ZRcgrps.png"
  },
});

const Bus = mongoose.model("Bus", busSchema);

module.exports = Bus;

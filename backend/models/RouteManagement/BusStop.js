const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stopSchema = new Schema({
  stopName: {
    type: String,
    required: true,
  },

  lat: {
    type: Number,
    required: true,
  },

  lon: {
    type: Number,
    required: true,
  },

});

const BusStop = mongoose.model("BusStop", stopSchema);

module.exports = BusStop;
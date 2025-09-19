const router = require("express").Router();
let BusStop = require("../models/BusStop");

//adding new bus stop to the data base
router.route("/addStop").post(async (req, res) => {
  const { stopName, lat, lon } =
    req.body;

  try {
    const newStop = new BusStop({
      stopName,
      lat,
      lon,
    });

    await newStop.save();
    res.json("New stop added succesfully");
  } catch (err) {
    console.log("Error occured while adding new stop " + err);
    res.status(500).json("Error occured while adding new stop");
  }
});

//Loading bus stop data
router.route("/loadstops").get(async (req, res) => {
  const stops = await BusStop.find();

  if (stops) {
    res.status(200).send(stops);
  } else {
    res.status(404).json("Bus Stop data not found");
  }
});

//filtering bus stops based on the searched name
router.route("/searchstop/:stop").get(async (req, res) => {
  const name = req.params.stop;

  try {
    const stop = await BusStop.find({
      stopName: { $regex: name, $options: "i" }, //for the case insensitivity
    });

    if (!stop) {
      return res.status(404).json({ message: "Bus Stop not found" });
    }
    res.json(stop);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while retreiving bus stop data" });
  }
});

//displaying the bus stops location on the map
router.route("/displayStop/:stopId").get(async (req, res) => {
  const stopId = req.params.stopId;
  const stop = await BusStop.findById(stopId);

  if (stop) {
    res.status(200).json(stop);
  } else {
    res.status(404).json("Stop not found");
  }
});

module.exports = router;

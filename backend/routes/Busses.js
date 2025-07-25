const router = require("express").Router();
let Bus = require("../models/Bus");
const calcDistance = require("../distanceCalculation");

//adding new bus to the data base
router.route("/addBus").post(async (req, res) => {
  const { vehicleNumber, vehicleType, avlSeats, route, schedule, status } = req.body;

  try {
    const existingVehicle = await Bus.findOne({
      vehicleNumber: vehicleNumber,
    });

    if (existingVehicle) {
      return res.status(400).json("Vehicle already registered");
    }

    const newVehicle = new Bus({
      vehicleNumber,
      vehicleType,
      avlSeats,
      route,
      schedule,
      status,
    });

    await newVehicle.save();
    res.json("Vehicle registered successfully");
  } catch (err) {
    console.log("Error occured while registering the new vehicle" + err);
    res.status(500).json("Error occured while registering the new vehicle");
  }
});

//Updating the current location of the bus
//longtitude and latitude needs to be taken from the gps module - !! Important !!

router.route("/updateLocation/:id").put(async (req, res) => {
  let vehicleId = req.params.id;

  console.log("Vehicle ID" + vehicleId);

  //this should be replaced by the gps data

  const lat = 6.915298;
  const lon = 79.870903;
  const bus = await Bus.findById(vehicleId).populate("route").populate("schedule");

  //console.log("Test " + bus.lat);

  if (!bus || !bus.schedule || !bus.schedule.stopSchedules) {
    console.log("\nSchedule data missing");
    return res.status(404).json({ message: "Schedule not found for this bus" });
  }else{
    console.log("\nBus data found");
  }

    const arrivedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }); 

  const expectedTime = bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival;

  console.log("\nExpected time : " + expectedTime);

  //updating the active status of the bus if the bus is in the initial bus stop

  if (arrivedTime == expectedTime) {
    bus.activeStatus = "On duty";
    await bus.save();
  }

  //bus.route[bus.nextStopIndex].lat
  //This will get the route array from the bus object, and the that arrays latitude will be taken by using the next Stop index

  const distance = calcDistance(
    bus.route.stopsSequence[bus.nextStopIndex].lat,
    bus.route.stopsSequence[bus.nextStopIndex].lon,
    lat,
    lon
  );

  console.log(
    "\nDistance to the next bus stand : " + distance.toFixed(2) + " m"
  );

  //if the bus is in the radius of 5m, it's considers as the arrived
  if (distance <= 5) {
    console.log(
      "\nBus has arrived to the " +
        bus.route[bus.nextStopIndex].stopName +
        " bus stop"
    );

    bus.nextStopIndex += 1;

    if (arrivedTime > expectedTime) {
      console.log("Bus is late");
      bus.status = "Late";
    } else {
      console.log("Bus On time");
      bus.status = "Ontime";
    }

    if (bus.nextStopIndex >= bus.route.length) {
      console.log("Bus has arrived at it's destination");
      //resetting data
      bus.nextStopIndex = 0;
      bus.status = "Ontime";
      bus.activeStatus = "On duty";
    } else {
      console.log("Next stop:", bus.route[bus.nextStopIndex].stopName);
    }
  } else {
    console.log("Not arrived yet");
  }

  //updating current location of the bus
  bus.lat = lat;
  bus.lon = lon;
  await bus.save();

  res.status(200).send({
    status: bus.status,
    nextStop:
      bus.nextStopIndex < bus.route.length
        ? bus.route[bus.nextStopIndex].stopName
        : "Destination reached",
    previousStop:
      bus.nextStopIndex > 0 && bus.nextStopIndex - 1 < bus.route.length
        ? bus.route[bus.nextStopIndex - 1].stopName
        : "Not started",
    vehicleNumber: bus.vehicleNumber,
    currentStatus: bus.status,
    activeStatus: bus.activeStatus,
    lat: bus.lat,
    lon: bus.lon,
    route: bus.route,
  });
});

router.route("/getId/:routeNumber").get(async (req, res) => {
  const { routeNumber } = req.params;
  try {
    const buses = await Bus.find({
      routeNum: parseInt(routeNumber),
      activeStatus: "On duty",
    });

    if (buses.length === 0)
      return res
        .status(404)
        .json({ message: "No active buses found for this route" });

    const busIds = buses.map((bus) => bus._id);
    res.json({ busIds, count: busIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

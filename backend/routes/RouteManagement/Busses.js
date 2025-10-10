const router = require("express").Router();
let Bus = require("../../models/RouteManagement/Bus");
const calcDistance = require("../../distanceCalculation");
const Route = require("../../models/RouteManagement/Route");

//adding new bus to the data base
router.route("/addBus").post(async (req, res) => {
  const {
    vehicleNumber,
    vehicleType,
    avlSeats,
    route,
    schedule,
    status,
    busImage,
  } = req.body;

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
      busImage,
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
router.route("/updateLocation").put(async (req, res) => {
  let destinationReached = false;

  //Lat and Lon taken from the GPS module
  const { busId, lat, lon } = req.body;

  console.log("Bus ID :" + busId);

  const bus = await Bus.findById(busId)
    .populate({
      path: "route",
      populate: {
        path: "stopsSequence",
        model: "BusStop",
      },
    })
    .populate("schedule");

  if (!bus || !bus.schedule || !bus.schedule.stopSchedules) {
    console.log("\nSchedule data missing");
    return res.status(404).json({ message: "Schedule not found for this bus" });
  } else {
    console.log("\nBus data found");
  }

  const arrivedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const busStatus = bus.status;

  const expectedTime =
    bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival;
  console.log("Expected time : " + expectedTime);

  //updating the active status of the bus if the bus is in the initial bus stop
  if (arrivedTime == expectedTime) {
    bus.activeStatus = "On duty";
    await bus.save();
  }
  const distance = calcDistance(
    bus.route.stopsSequence[bus.nextStopIndex].lat,
    bus.route.stopsSequence[bus.nextStopIndex].lon,
    lat,
    lon
  );

  console.log("Distance to the next bus stand : " + distance.toFixed(2) + " m");

  //if the bus is in the radius of 5m, it's considered as arrived
  if (distance <= 5) {
    console.log(
      "\nBus has arrived to the " +
        bus.route.stopsSequence[bus.nextStopIndex].stopName +
        " bus stop"
    );

    //checking if the bus has reached it's destination
    if (bus.nextStopIndex == bus.route.stopsSequence.length - 1) {
      console.log("Bus has arrived at it's destination");
      destinationReached = true;
    }

    //checking whether the bus arrived on time
    if (arrivedTime > expectedTime) {
      console.log("Bus is late");
      bus.status = "Late";
    } else {
      console.log("Bus On time");
      bus.status = "Ontime";
    }

    //resetting bus information
    if (destinationReached) {
      bus.nextStopIndex = 0;
      bus.status = "Ontime";
    } else {
      bus.nextStopIndex += 1;
    }
  } else {
    console.log("Not arrived yet");
  }

  //updating current cordinates of the bus
  bus.lat = lat;
  bus.lon = lon;

  await bus.save();

  //creating event to pass
  const io = req.app.get("io");
  io.emit("busLocationUpdate", { busId, lat, lon, busStatus });
  res.sendStatus(200);
});

//Useless now
/*
router.route("/getId/:routeNumber").get(async (req, res) => {
  const { routeNumber } = req.params;
  try {
    const buses = await Bus.find({
      activeStatus: "On duty",
    }).populate("route");

    const routeBuses = buses.filter(
      (bus) => bus.route && bus.route.routeNum === parseInt(routeNumber)
    );

    if (routeBuses.length === 0)
      return res
        .status(404)
        .json({ message: "No active buses found for this route" });

    const busIds = routeBuses.map((bus) => bus._id);
    res.json({ busIds, count: busIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); */

//Loading all bus information
router.route("/loadBuses").get(async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate({
        path: "route",
        populate: {
          path: "stopsSequence",
          model: "BusStop",
        },
      })
      .populate("schedule");

    if (!buses || buses.length === 0) {
      return res.status(404).json({ message: "Buses not found" });
    }

    const response = buses.map((bus) => ({
      _id: bus._id,
      status: bus.status,
      nextStop:
        bus.nextStopIndex < bus.route.stopsSequence.length
          ? bus.route.stopsSequence[bus.nextStopIndex].stopName
          : "Destination reached",
      previousStop:
        bus.nextStopIndex > 0 &&
        bus.nextStopIndex - 1 < bus.route.stopsSequence.length
          ? bus.route.stopsSequence[bus.nextStopIndex - 1].stopName
          : "Not started",
      vehicleNumber: bus.vehicleNumber,
      activeStatus: bus.activeStatus,
      lat: bus.lat,
      lon: bus.lon,
      type: bus.vehicleType,
      busImage: bus.busImage,
      routeNum: bus.route.routeNum,
      ETA: bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival,
      route: bus.route.stopsSequence,
      schedule: bus.schedule,
      seatCount: bus.avlSeats,
    }));

    res.status(200).send(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Loading bus information after filtering
router.route("/loadBus/:routeNumber").get(async (req, res) => {
  const { routeNumber } = req.params;
  try {
    const buses = await Bus.find()
      .populate({
        path: "route",
        populate: {
          path: "stopsSequence",
          model: "BusStop",
        },
      })
      .populate("schedule");

    const bus = buses.filter(
      (b) => b.route && b.route.routeNum === parseInt(routeNumber)
    );

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const response = bus.map((bus) => ({
      _id: bus._id,
      status: bus.status,
      nextStop:
        bus.nextStopIndex < bus.route.stopsSequence.length - 1
          ? bus.route.stopsSequence[bus.nextStopIndex].stopName
          : bus.route.stopsSequence[bus.nextStopIndex].stopName,
      previousStop:
        bus.nextStopIndex > 0 &&
        bus.nextStopIndex - 1 < bus.route.stopsSequence.length
          ? bus.route.stopsSequence[bus.nextStopIndex - 1].stopName
          : "Not started",
      vehicleNumber: bus.vehicleNumber,
      currentStatus: bus.status,
      activeStatus: bus.activeStatus,
      lat: bus.lat,
      lon: bus.lon,
      type: bus.vehicleType,
      busImage: bus.busImage,
      routeNum: bus.route.routeNum,
      route: bus.route.stopsSequence,
      ETA: bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival,
      schedule: bus.schedule,
    }));

    res.status(200).send(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//view location of the bus
router.route("/viewlocation/:id").get(async (req, res) => {
  const busId = req.params.id;

  const bus = await Bus.findById(busId)
    .populate({
      path: "route",
      populate: {
        path: "stopsSequence",
        model: "BusStop",
      },
    })
    .populate("schedule");

  if (!bus) {
    return res.status(404).send("Bus not found");
  }

  const response = {
    _id: bus._id,
    lat: bus.lat,
    lon: bus.lon,
    route: bus.route,
  };

  res.status(200).send(response);
});

//returning the count of active buses
router.route("/getcount").get(async (req, res) => {
  const busCount = await Bus.countDocuments({ activeStatus: "On duty" });
  if (busCount === null) {
    return res.status(404).json({ message: "No active buses found" });
  }

  res.status(200).json({ count: busCount });
});

//removing bus
router.route("/deletebus/:id").delete(async (req, res) => {
  try {
    const busId = req.params.id;

    console.log("Removing bus : ", busId);

    const deletedBus = await Bus.findByIdAndDelete(busId);

    if (!deletedBus) {
      return res.status(404) / json({ message: "Bus not found" });
    }

    console.log("Bus removed successfully");
    res.json({ message: "Bus removed successfully" });
  } catch (err) {
    console.error("Error occured while removing bus " + err);
    res.status(500).json({ message: "Error occured while removing bus" });
  }
});

//searching bus (Admin table)
router.route("/searchbus/:vehicleNum").get(async (req, res) => {
  const vehicleNum = req.params.vehicleNum;

  try {
    const buses = await Bus.find({ vehicleNumber: vehicleNum })
      .populate({
        path: "route",
        populate: {
          path: "stopsSequence",
          model: "BusStop",
        },
      })
      .populate("schedule");

    if (!bus) {
      return res.status(404).json([]);
    }

    const response = buses.map((bus) => ({
      _id: bus._id,
      status: bus.status,
      nextStop:
        bus.nextStopIndex < bus.route.stopsSequence.length
          ? bus.route.stopsSequence[bus.nextStopIndex].stopName
          : "Destination reached",
      previousStop:
        bus.nextStopIndex > 0 &&
        bus.nextStopIndex - 1 < bus.route.stopsSequence.length
          ? bus.route.stopsSequence[bus.nextStopIndex - 1].stopName
          : "Not started",
      vehicleNumber: bus.vehicleNumber,
      activeStatus: bus.activeStatus,
      lat: bus.lat,
      lon: bus.lon,
      type: bus.vehicleType,
      busImage: bus.busImage,
      routeNum: bus.route.routeNum,
      ETA: bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival,
      route: bus.route.stopsSequence,
      schedule: bus.schedule,
      seatCount: bus.avlSeats,
    }));

    res.status(200).send([response]);

  } catch (err) {
    console.error("No bus found for this vehicle number " + err);
    res.status(500).json({ message: "Error while retreiving bus data" + err });
  }
});

module.exports = router;

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
  try {
    let destinationReached = false;
    const io = req.app.get("io");

    const { busId, lat, lon } = req.body;
    console.log("Bus ID: " + busId);

    // Fetch bus with route and schedule
    const bus = await Bus.findById(busId)
      .populate({
        path: "route",
        populate: { path: "stopsSequence", model: "BusStop" },
      })
      .populate("schedule");

    if (!bus || !bus.schedule || !bus.schedule.stopSchedules) {
      console.log("Schedule data missing");
      return res.status(404).json({ message: "Schedule not found for this bus" });
    }

    console.log("Bus data found");

    // Mock/demo time
    const arrivedTime = "08:00";
    console.log("Arrived time: " + arrivedTime);

    const nextStopData =
      bus.nextStopIndex < bus.route.stopsSequence.length
        ? bus.route.stopsSequence[bus.nextStopIndex]
        : bus.route.stopsSequence[bus.route.stopsSequence.length - 1];

    const previousStop =
      bus.nextStopIndex > 0
        ? bus.route.stopsSequence[bus.nextStopIndex - 1].stopName
        : "Not started";

    const expectedTime = bus.schedule.stopSchedules[bus.nextStopIndex].expectedArrival;
    const arrivedDate = new Date(`1970-01-01T${arrivedTime}:00Z`);
    const expectedDate = new Date(`1970-01-01T${expectedTime}:00Z`);
    const busStatus = bus.status;

    // Update active status if at initial stop
    if (arrivedTime === expectedTime) {
      bus.activeStatus = "On duty";
      await bus.save();
    }

    // Interpolation function for smooth movement
    const interpolateCoords = (start, end, steps) => {
      const coords = [];
      const latStep = (end.lat - start.lat) / steps;
      const lonStep = (end.lon - start.lon) / steps;
      for (let i = 1; i <= steps; i++) {
        coords.push({ lat: start.lat + latStep * i, lon: start.lon + lonStep * i });
      }
      return coords;
    };

    // Generate smooth points between current location and next stop
    const smoothPoints = interpolateCoords(
      { lat: bus.lat, lon: bus.lon },
      { lat: nextStopData.lat, lon: nextStopData.lon },
      45
    );

    // Update bus location along intermediate points
    for (let point of smoothPoints) {
      bus.lat = point.lat;
      bus.lon = point.lon;

      const distance = calcDistance(nextStopData.lat, nextStopData.lon, point.lat, point.lon);

      // Check if bus has arrived within 5 meters
      if (distance <= 5) {
        console.log(`Bus arrived at ${nextStopData.stopName}`);

        // Check if destination reached
        if (bus.nextStopIndex === bus.route.stopsSequence.length - 1) {
          console.log("Bus has reached destination");
          destinationReached = true;
        }

        // Check for delay
        if (arrivedDate > expectedDate) {
          bus.status = "Late";
          const delay = Math.floor((arrivedDate - expectedDate) / 60000);
          io.emit("busDelay", {
            vehicleNumber: bus.vehicleNumber,
            delay,
            busStop: nextStopData.stopName,
          });
        } else {
          bus.status = "Ontime";
          io.emit("busOntime", {
            vehicleNumber: bus.vehicleNumber,
            busStop: nextStopData.stopName,
          });
        }

        // Update next stop index
        bus.nextStopIndex = destinationReached ? 0 : bus.nextStopIndex + 1;
      }

      await bus.save();

      io.emit("busLocationUpdate", {
        busId,
        lat: point.lat,
        lon: point.lon,
        busStatus: bus.status,
        nextStop: nextStopData.stopName,
        previousStop: previousStop,
        arrivedTime,
        expectedTime,
      });

      await new Promise((r) => setTimeout(r, 100)); // Delay for smooth animation
    }

    // Ensure last stop is displayed on frontend
    bus.lat = nextStopData.lat;
    bus.lon = nextStopData.lon;

    io.emit("busLocationUpdate", {
      busId,
      lat: bus.lat,
      lon: bus.lon,
      busStatus: bus.status,
      nextStop: nextStopData.stopName,
      previousStop: previousStop,
      arrivedTime,
      expectedTime,
    });

    await bus.save();

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in updateLocation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});




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

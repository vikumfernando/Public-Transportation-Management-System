const router = require("express").Router();
let Schedule = require("../models/Schedule");
let Bus = require("../models/Bus");

//adding schedules
router.route("/addschedule").post(async (req, res) => {
  const { routeId, dayType, stopSchedules } = req.body;
  const startTime = stopSchedules[0].expectedArrival;

  try {
    //checking whether theres already a shcedule for the route number and the start time
    const existingSchedule = await Schedule.findOne({
      routeId: routeId,
      "stopSchedules.0.expectedArrival": startTime,
    });

    if (existingSchedule) {
      return res.status(400).json("Schedule already added");
    }

    const newSchedule = new Schedule({
      routeId,
      dayType,
      stopSchedules,
    });

    await newSchedule.save();
    res.json("Schedule added successfully");
  } catch (err) {
    console.log("Error occured while adding schedule " + err);
    res.status(500).json("Error occured while adding schedule");
  }
});

//Searching bus for the given schedule ID
//Might want to remove this
router.route("/searchAssigned/:scheduleId").get(async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;

    const bus = await Bus.findOne({
      schedule: scheduleId,
    });

    if (!bus) {
      console.log("Bus not found");
    } else {
      console.log("Bus data", bus);
    }
  } catch (err) {
    console.error("Error while retreiving bus data " + err);
  }
});

//loading all schedules
router.route("/loadschedules").get(async (req, res) => {

  console.log("Load schedules route hit"); 

  try {
    const schedules = await Schedule.find()
      .populate({
        path: "routeId",
        model: "Route",
        populate: {
          path: "stopsSequence",
          model: "BusStop",
        },
      });

    res.status(200).json(schedules);
  } catch (err) {
    console.error("Error loading schedules: ", err);
    res.status(500).json({ message: "Error loading schedules: " + err });
  }
});



module.exports = router;

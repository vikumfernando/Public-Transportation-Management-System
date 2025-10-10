const router = require("express").Router();
let Schedule = require("../../models/RouteManagement/Schedule");
let Bus = require("../../models/RouteManagement/Bus");

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

router.route("/deleteSchedule/:id").delete(async(req, res) => {
  try{
    const scheduleId = req.params.id;
    const referenced = await Bus.findOne({schedule: scheduleId});

    if(referenced){
      return res.status(400).json("Cannot delete schedule as it is assigned to a bus");
    }

    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

    if(!deletedSchedule){
      return res.status(404).json("Schedule not found");
    }

    console.log("Deleted schedule:", deletedSchedule);
    res.status(200).json("Schedule deleted successfully");
  }catch{
    res.status(500).json("Error while deleting schedule");
  }
});

router.route("/updateSchedule/:id").put(async(req, res) => {
  try{
    const scheduleId = req.params.id;
    const { routeId, dayType, stopSchedules } = req.body;
    const startTime = stopSchedules[0].expectedArrival;   
    const existingSchedule = await Schedule.findOne({
      routeId: routeId,
      "stopSchedules.0.expectedArrival": startTime,
      _id: { $ne: scheduleId } // Exclude the current schedule from the search
    }); 
    if (existingSchedule) {
      return res.status(400).json("Schedule already added");
    }
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { routeId, dayType, stopSchedules },
      { new: true }
    );    
    if(!updatedSchedule){
      return res.status(404).json("Schedule not found");
    } 
    console.log("Updated schedule:", updatedSchedule);
    res.status(200).json("Schedule updated successfully");
  }catch(err){
    console.error("Error while updating schedule: ", err);
    res.status(500).json("Error while updating schedule");
  } 
});


module.exports = router;

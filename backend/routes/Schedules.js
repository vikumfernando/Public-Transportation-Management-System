const router = require("express").Router();
let Schedule = require("../models/Schedule");


//adding schedules
router.route("/addschedule").post(async (req, res) => {
    const {routeId, dayType, stopSchedules} = req.body;
    const startTime = stopSchedules[0].expectedArrival;

    try {
        //checking whether theres already a shcedule for the route number and the start time
        const existingSchedule = await Schedule.findOne({
            routeId : routeId,
            "stopSchedules.0.expectedArrival": startTime,
        })

        if (existingSchedule) {
         return res.status(400).json("Schedule already added");
        }

        const newSchedule = new Schedule({
            routeId, 
            dayType,
            stopSchedules
        });

        await newSchedule.save();
        res.json("Schedule added successfully");

    }catch(err) {
        console.log("Error occured while adding schedule " + err);
        res.status(500).json("Error occured while adding schedule");
    }
});

module.exports = router;
const router = require("express").Router();
let Schedule = require("../models/Schedule");


//adding schedules
router.route("/addschedule").post(async (req, res) => {
    const {routeId, dayType, stopSchedules} = req.body;

    try {
        const existingSchedule = await Schedule.findOne({
            routeId : routeId
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
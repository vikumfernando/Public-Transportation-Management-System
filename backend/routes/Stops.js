const router = require("express").Router();
let BusStop = require("../models/BusStop");

//adding new bus stop to the data base
router.route("/addStop").post(async (req, res) => {
    const {stopName, start, destination, routeNumber, lat, lon, expectedTime } = req.body;

    try{
        
        const newStop = new BusStop ({
            stopName,
            start,
            destination,
            routeNumber,
            lat,
            lon,
            expectedTime
        });

        await newStop.save();
        res.json("New stop added succesfully");

    }catch(err){
        console.log("Error occured while adding new stop " + err);
        res.status(500).json("Error occured while adding new stop");
    }
});

module.exports = router;
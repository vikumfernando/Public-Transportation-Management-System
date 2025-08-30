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


//Loading bus stop data
router.route("/loadstops").get(async (req, res) => {
    const stops = await BusStop.find();

    if(stops){
        res.status(200).send(stops);
    }else{
        res.status(404).json("Bus Stop data not found")
    }
});


router.route("/displayStop/:stopId").get(async(req, res) => {
    
    const stopId = req.params.stopId;
    const stop = await BusStop.findById(stopId);

    if(stop){
        res.status(200).json(stop)
    }else{
        res.status(404).json("Stop not found")
    }
});

module.exports = router;
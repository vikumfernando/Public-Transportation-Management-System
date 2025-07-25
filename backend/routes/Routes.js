const router = require("express").Router();
let Route = require("../models/Route");

router.route("/addRoute").post(async (req, res) => {
    
    const {routeName, routeNum, stopsSequence, startFare} = req.body;

    try{
        const existingRoute = await Route.findOne({
            routeNum : routeNum,
        });
        
        if(existingRoute){
            return res.status(400).json("Route alradey registered");
        }

        const newRoute = new Route({
            routeName,
            routeNum,
            stopsSequence,
            startFare
        });

        await newRoute.save();
        res.json("Route added successfully");
    }catch(err){
        console.log("Error while adding new route " + err);
        res.status(500).json("Error occured while addin new route");
    }

});

module.exports = router;
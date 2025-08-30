const router = require("express").Router();
let Route = require("../models/Route");

router.route("/addRoute").post(async (req, res) => {
  const { routeName, routeNum, stopsSequence, startFare } = req.body;

  try {
    const existingRoute = await Route.findOne({
      routeNum: routeNum,
    });

    if (existingRoute) {
      return res.status(400).json("Route alradey registered");
    }

    const newRoute = new Route({
      routeName,
      routeNum,
      stopsSequence,
      startFare,
    });

    await newRoute.save();
    res.json("Route added successfully");
  } catch (err) {
    console.log("Error while adding new route " + err);
    res.status(500).json("Error occured while addin new route");
  }
});

//returning the number of active routes
router.route("/getcount").get(async (req, res) => {
  const routeCount = await Route.countDocuments();

  if (routeCount === 0) {
    res.status(404).json("No routes found");
  }

  res.status(200).json({ count: routeCount });
});

//Loading available routes
router.route("/loadroutes").get(async (req, res) => {
  const routes = await Route.find().populate("stopsSequence");

  if (routes) {
    res.status(200).send(routes);
  } else {
    res.status(404).json("Route data not found");
  }
});

//Displayng routes on map
router.route("/locateStops/:routeId").get(async (req, res) => {
  
  const routeId = req.params.routeId;
  const routeInt = parseInt(routeId);
  
  console.log("Route id : " + routeId);
 
  const route = await Route.findOne({
    routeNum: routeInt,
  }).populate("stopsSequence");

  if (route) {
    res.status(200).json(route);
  } else {
    res.status(404).json("Route not found");
  }

});

module.exports = router;


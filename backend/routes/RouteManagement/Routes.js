const router = require("express").Router();
let Route = require("../../models/RouteManagement/Route");
let Schedule = require("../../models/RouteManagement/Schedule");

//adding new route to the db
router.route("/addRoute").post(async (req, res) => {
  const { routeName, routeNum, stopsSequence, distance, duration } = req.body;

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
      distance,
      duration,
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

//Loading all available routes
router.route("/loadroutes").get(async (req, res) => {
  const routes = await Route.find().populate("stopsSequence");

  if (routes) {
    res.status(200).send(routes);
  } else {
    res.status(404).json("Route data not found");
  }
});

//Displaying stops relevant to the route,  on map
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

//search route function
router.route("/searchroute/:routenum").get(async (req, res) => {
  const routenum = req.params.routenum;

  try {
    const route = await Route.find({
      routeNum: routenum,
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while retreiving route data" });
  }
});

//Deleting route
router.route("/deleteroute/:id").delete(async (req, res) => {
  try {
    const routeId = req.params.id;

    console.log("Route to be deleted : " + routeId);

    const referenced = await Schedule.findOne({ _id: routeId  });


     console.log(referenced);

    if (referenced) {
      return res.status(400).json({
        message: `Cannot delete : Route is used in a schedule ${referenced.data}`,
      });
    }

    const deleteRoute = await Route.findByIdAndDelete(routeId);

    if (!deleteRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    console.log("Route deleted successfully");
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.log("Error while deleting route : " + err);
  }
});

//updating route
router.route("/updateroute/:id").put(async (req, res) => {
  
  const routeId = req.params.id;
  const {routeNum, duration, distance, routeName, stopsSequence} = req.body;

  try{
    const updatedRoute = await Route.findByIdAndUpdate(
      routeId,
      {}
    )
  }catch(err){
    console.log("Error while updating route information : " + err);
  }
});

module.exports = router;

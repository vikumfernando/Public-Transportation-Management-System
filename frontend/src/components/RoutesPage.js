import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RoutesPage.css";
import "../styles/BusStopPage.css";
import OffCanvas from "../components/OffCanvas";
import RouteMap from "../components/RouteMap";

function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [openCard, setOpenCard] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [routeNum, setRouteNum] = useState(null);
  const [routeName, setRouteName] = useState("");
  const [stopSequence, setStopSequence] = useState([]);
  const [distance, setRouteDistance] = useState(null);
  const [duration, setRouteDuration] = useState(null);

  const [selectedStops, setSelectedStops] = useState([""]);
  const [dropdownStops, setDropdownStops] = useState([""]);

  useEffect(() => {
    const getRoutes = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Routes/loadroutes");
        setRoutes(res.data);
      } catch (err) {
        console.error("Error while fetching route data : " + err);
      }
    };
    getRoutes();

    {
      /*Loading all stops when rendering for the dropdown box*/
    }
    const getStops = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Stops/loadStops");
        setDropdownStops(res.data);
      } catch (err) {
        console.log("Error while fetching bus stop data : " + err);
      }
    };

    getStops();
  }, []);

  //Function to load selected route stops
  async function loadRoute(routeId) {
    setOpenCard(routeId);
    const routes = await axios.get(
      `http://localhost:8070/Routes/locateStops/${routeId}`
    );

    if (routes) {
      console.log("Passing Route Data : ", routes.data.stopsSequence);
      setStops(routes.data.stopsSequence);
    } else {
      console.log("Routes empty");
    }
  }

  //Route searching
  async function searchRoute(routeNum) {
    try {
      const res = await axios.get(
        `http://localhost:8070/Routes/searchroute/${routeNum}`
      );

      console.log("Response of route searching : ", res);
      if (res) {
        setRoutes(res.data);
        console.log("Search stop data : ", stops);
      } else {
        console.log("Bus stop not found");
      }
    } catch (err) {
      console.error("Error : " + err);
    }
  }

  //Adding new route
  const addRoute = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8070/Routes/addRoute", {
        routeNum: parseInt(routeNum),
        routeName,
        distance,
        duration,
        stopsSequence: selectedStops,
      });
    } catch (err) {
      console.error(err);
    }
  };

  //Deleting route
  const deleteRoute = async (routeId, e) => {
    
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this route")) return;

    try {
      const res = await axios.delete(
        `http://localhost:8070/Routes/deleteroute/${routeId}`
      );

      setRoutes(routes.filter((route) => route._id !== routeId));

    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      }

      console.log("Error while deleting Route " + err);
    }
  };

  //slide bar handling
  function handleSideBar(status) {
    const sidebar = document.getElementById("sidebar2");
    if (status == true) {
      sidebar.classList.add("open");
    } else {
      sidebar.classList.remove("open");
    }
  }

  const handleChange = (index, stopId) => {
    const updatedStops = [...selectedStops];
    updatedStops[index] = stopId;
    setSelectedStops(updatedStops);
  };

  return (
    <div className="mainContainer2">
      <div className="mapContainer2">
        <RouteMap className="mapDiv2" stops={stops} />
      </div>
      <div className="overlay2">
        <div className="offCanvas">
          <OffCanvas />
        </div>

        <div className="routeCardsDiv">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchRoute(searchQuery);
            }}
          >
            <div className="search-container2">
              <input
                id="routeInput"
                type="text"
                className="search-box2"
                placeholder="Enter Route Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
              />

              <button className="filter-button2">
                <svg
                  className="filter-icon2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                </svg>
              </button>
            </div>
          </form>

          {routes.length > 0 &&
            routes.map((route, index) => (
              <div
                id="routeinfoDiv"
                className={`routeinfoDiv ${
                  openCard === route.routeNum ? "open" : ""
                }`}
                onClick={() => loadRoute(route.routeNum)}
              >
                
                <div className="routeNumDiv">
                  <label className="routeNum2">Route {route.routeNum}</label>
                  <br />

                  <img
                    className="timeIcon"
                    src="/images/timeIcon.png"
                    alt="timeIcon"
                  />
                  <label className="routeSumText">{route.duration} Hrs</label>

                  <img
                    className="roadIcon"
                    src="/images/distanceIcon.png"
                    alt="timeIcon"
                  />
                  <label className="routeSumText">{route.distance} Km</label>
                </div>
                
                <div
                  id="stopList"
                  className={`stopList ${
                    openCard === route.routeNum ? "open" : ""
                  }`}
                >
                  <label className="routeName">{route.routeName}</label>
                  <br />
                  <ul className="stopNames">
                    {route.stopsSequence.map((stop, stopIndex) => (
                      <li key={stopIndex}>{stop.stopName}</li>
                    ))}
                  </ul>

                  <div className="">
                    <button onClick = {(e) =>deleteRoute(route._id, e)}>Delete</button>
                    <button>Edit</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div id="sidebar2" className="sidebar2">
          <button
            onClick={() => handleSideBar(false)}
            className="closeBtn"
            type="button"
          >
            <img
              className="closeImg"
              src="/images/closeBtn.png"
              alt="Submit btn image"
            />
          </button>

          <label className="addbusTopic">Add New Route</label>

          <form onSubmit={addRoute}>
            {/*First row */}
            <div style={{ display: "flex" }}>
              <div style={{ width: "50%", marginRight: "17px" }}>
                <label className="inputLabel">Route Number</label>
                <br />
                <input
                  className="inputField2"
                  type="text"
                  onChange={(e) => setRouteNum(e.target.value)}
                  placeholder="Route Number"
                  required
                />
              </div>

              <div style={{ width: "50%" }}>
                <label className="inputLabel">Route Name</label>
                <br />
                <input
                  className="inputField2"
                  type="text"
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Start - Destination"
                  required
                />
              </div>
            </div>

            {/*Second row */}
            <div style={{ display: "flex" }}>
              <div style={{ width: "50%", marginRight: "17px" }}>
                <label className="inputLabel">Distance</label>
                <br />
                <input
                  className="inputField2"
                  type="text"
                  onChange={(e) => setRouteDistance(e.target.value)}
                  placeholder="Distance (in Km)"
                  required
                />
              </div>
              <div style={{ width: "50%" }}>
                <label className="inputLabel">Duration</label>
                <br />
                <input
                  className="inputField2"
                  type="text"
                  onChange={(e) => setRouteDuration(e.target.value)}
                  placeholder="Duration (in Hrs)"
                  required
                />
                <br />
              </div>
            </div>

            <label className="inputLabel">Add Stops</label>

            {/*Implement the bus stop adding part here */}
            {/*Bus stop list on the left, dropdown boxes on the right with all the bus stops available */}

            <div className="newStopsDiv">
              {selectedStops.map((stopId, index) => (
                <div style={{ display: "flex" }}>
                  {/*Left div */}
                  <div style={{ width: "65%" }}>
                    <label className="selectedStopsLabel">
                      {index + 1 + "."}
                      <span style={{ marginLeft: "8px" }}>
                        {stopId
                          ? dropdownStops.find((s) => s._id === stopId)
                              ?.stopName
                          : "No stop selected"}
                      </span>
                    </label>
                  </div>

                  {/*Right div */}

                  <div style={{ width: "50%" }}>
                    <select
                      className="dropdown-select"
                      value={stopId || ""}
                      onChange={(e) => handleChange(index, e.target.value)}
                    >
                      <option value={""}>Select Bus Stop</option>
                      {dropdownStops.map((stop) => (
                        <option key={stop._id} value={stop._id}>
                          {stop.stopName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setSelectedStops([...selectedStops, ""])}
                className="addButton"
              >
                Add More
              </button>
            </div>

            <button className="inputBtn" type="submit">
              <img
                className="submitImage"
                src="/images/check.png"
                alt="Submit btn image"
              />
            </button>
          </form>
        </div>
      </div>

      <button className="slideBtn" onClick={() => handleSideBar(true)}>
        <img className="slideImg" src="/images/addBusIcon.png" alt="check" />
      </button>
    </div>
  );
}

export default RoutePage;

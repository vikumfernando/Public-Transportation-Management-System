import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RoutesPage.css";
import "../styles/BusStopPage.css";
import RouteMap from "../components/RouteMap";

function RoutePageUser() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [openCard, setOpenCard] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

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

  

  return (
    <div className="mainContainer2">
      <div className="mapContainer2">
        <RouteMap className="mapDiv2" stops={stops} />
      </div>
      <div className="overlay2">
        

        <div className="routeCardsDiv" style = {{marginTop : "90px"}}>
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

                </div>
              </div>
            ))}
        </div>
        
      </div>
    </div>
  );
}

export default RoutePageUser;

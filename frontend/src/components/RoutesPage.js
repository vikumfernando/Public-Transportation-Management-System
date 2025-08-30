import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RoutesPage.css";

function RoutePage({ setRouteStop }) {
  const [routes, setRoutes] = useState([]);

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
  }, []);

  //onclick
  async function loadRoute(routeId) {
    const routes = await axios.get(
      `http://localhost:8070/Routes/locateStops/${routeId}`
    );

    if (routes) {
      console.log("Passing Route Data : ", routes.data.stopsSequence);
      setRouteStop(routes.data.stopsSequence);
    } else {
      console.log("Routes empty");
    }
  }

  return (
    <div className="routeContainer">
      {routes.length > 0 &&
        routes.map((route, index) => (
          <div className="routeinfoDiv">
            <div onClick={() => loadRoute(route.routeNum)} key={index}>
              <p>Route Number : {route.routeNum}</p>
              <p>Route Name : {route.routeName}</p>
              <ul>
                {route.stopsSequence.map((stop, stopIndex) => (
                  <li key={stopIndex}>{stop.stopName}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
    </div>
  );
}

export default RoutePage;

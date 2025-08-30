import { useState } from "react";
import axios from "axios";
import "../styles/searchRoute.css";

//searching the bus route for the given route number
function SearchRoute({ setBusLocation, setStops }) {
  const [routeNum, setRouteNum] = useState("");
  const [busInfo, setBusInfo] = useState([]);
  const [displayInfo, setDisplayInfo] = useState([]);
  
  /* delete this
  async function getBusId() {
    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/getId/${routeNum}`
      );

      const ids = res.data.busIds || res.data.busId || [];
      setId(ids);
      console.log("Bus IDs:", ids);
      return ids;
    } catch (err) {
      console.log("Error while fetching bus Id " + err);
      return [];
    }
  } 
    */

  //updating current location of the bus
  async function updateLocation(busId, e) {
    if (e) e.preventDefault();

    console.log("Bus ID to update:", busId);
    try {

      const res = await axios.put(
        `http://localhost:8070/Busses/updateLocation/${busId}`
      );

      console.log("Bus update response for ID", busId, ":", res.data);

      setBusInfo((prev) => prev.map((bus) => (bus._id === busId ? res.data : bus))
      );

      setBusLocation({
        lat: res.data.lat,
        lng: res.data.lon,
      });

      setStops(res.data.route.stopsSequence || []);

    } catch (err) {
      console.error("Error updating location for ID", busId, ":", err);
    }
  }

  //displaying bus information
  const displayBusses = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/loadBus/${routeNum}`
      );

      setDisplayInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="input-container">
        <form onSubmit={displayBusses}>
          <input
            className="input-field"
            type="text"
            placeholder="Enter route number"
            value={routeNum}
            onChange={(e) => setRouteNum(e.target.value)}
          />
          <button className="submit-button" type="submit">
            Search Buses
          </button>
        </form>
      </div>

      {displayInfo.length > 0 &&
        displayInfo.map((bus, index) => (
          <div
            onClick={() => updateLocation(bus._id)}
            className="busInfoDiv"
            key={bus._id}
          >
            <h2>Bus {index + 1}</h2>
            <p>
              <strong>Vehicle Num: </strong> {bus.vehicleNumber}
            </p>
            <p>
              <strong>Status:</strong> {bus.status}
            </p>
            <p>
              <strong>Next Stop:</strong> {bus.nextStop}
            </p>
            <p>
              <strong>Prev Stop:</strong> {bus.previousStop}
            </p>
            <p>
              <strong>Latitude:</strong> {bus.lat}
            </p>
            <p>
              <strong>Longitude:</strong> {bus.lon}
            </p>
          </div>
        ))}
    </div>
  );
}

export default SearchRoute;

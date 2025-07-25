import { useState } from "react";
import axios from "axios";
import "../styles/searchRoute.css";

//searching the bus route for the given route number
function SearchRoute({ setBusLocation, setStops }) {
  const [routeNum, setRouteNum] = useState("");
  const [busId, setId] = useState([]);
  const [busInfo, setBusInfo] = useState(null);

  //retreiving bsus ID from the backend based on the route number
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

  //updating current location of the bus
  const updateLocation = async (e) => {
    if (e) e.preventDefault();
    const ids = await getBusId();
    for (const id of ids) {
      try {
        const res = await axios.put(
          `http://localhost:8070/Busses/updateLocation/${id}`
        );
        console.log("Bus update response for ID", id, ":", res.data);

        setBusInfo(res.data);

        setBusLocation({
          lat: res.data.lat,
          lng: res.data.lon,
        });

        setStops(res.data.route || []);

        console.log("Stops:", res.data.route);


      } catch (err) {
        console.error("Error updating location for ID", id, ":", err);
      }
    }
  };

  return (
    <div>
      <div class="input-container">
        <form onSubmit={updateLocation}>
          <input
            class="input-field"
            type="text"
            placeholder="Enter route number"
            value={routeNum}
            onChange={(e) => setRouteNum(e.target.value)}
          />
          <button class="submit-button" type="submit">
            Search Buses
          </button>
        </form>
      </div>

      {busInfo && (
        <div>
          <h1>Status : {busInfo.status}</h1>
          <h1>Next Stop : {busInfo.nextStop}</h1>
          <h1>Prev Stop : {busInfo.previousStop}</h1>
          <h1>Latitude : {busInfo.lat}</h1>
          <h1>Longtitude : {busInfo.lon}</h1>
          <h1>Vehicle Num : {busInfo.vehicleNumber}</h1>
        </div>
      )}
    </div>
  );
}
export default SearchRoute;

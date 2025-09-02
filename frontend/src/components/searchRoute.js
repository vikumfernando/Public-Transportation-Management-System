import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/searchRoute.css";
import "../styles/searchBox.css";
import BusMap from "../components/BusMap";
import { io } from "socket.io-client";

<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>;

//searching the bus route for the given route number
function SearchRoute({ setBusLocation, setStops, busLocation, stops }) {
  const [routeNum, setRouteNum] = useState("");
  const [busInfo, setBusInfo] = useState([]);
  const [displayInfo, setDisplayInfo] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    const getBuses = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Busses/loadBuses");
        setDisplayInfo(res.data);

      } catch (err) {
        console.log("Error while fetching buses : " + err);
      }
    };

    getBuses();
  }, []);

  // Socket.io Part
  useEffect(() => {
    const socket = io("http://localhost:8070");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server, id:", socket.id);
    });

    socket.on("busLocationUpdate", (data) => {
      console.log("Bus location update received:", data);

      //if the card bus id and the gps bus id doesn't match, location won't be updated
      if (selectedBus != data.busId) return;

      // Updating map location
      setBusLocation({ lat: data.lat, lng: data.lon });

      changeBtnClr(data.busStatus);

      // Update bus info in the list
      setBusInfo((prev) =>
        prev.map((bus) =>
          bus._id === data.busId
            ? { ...bus, lat: data.lat, lon: data.lon }
            : bus
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedBus]);

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
  async function fetchLocation(busId, e) {
    if (e) e.preventDefault();

    setSelectedBus(busId);
    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/viewlocation/${busId}`
      );

      console.log("Bus information for ID", busId, ":", res.data);

      setBusInfo((prev) =>
        prev.map((bus) => (bus._id === busId ? res.data : bus))
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

  //Input validation
  function validRouteNum(routeNumber) {
    const input = document.getElementById("routeInput");
    const warning = document.getElementById("warningText");

    const num = Number(routeNumber);
    const result = Number.isInteger(num);

    if (result === true) {
      input.classList.remove("invalid");
      warning.style.display = "none";
    } else {
      console.log("Invalid value detected");
      input.classList.add("invalid");
      warning.style.display = "block";
    }
  }

  //Button color change based on the arrival status
  function changeBtnClr(status) {
    const button = document.getElementById("statusBtn");

    if (status === "Late") {
      button.classList.add("late");
    } else {
      button.classList.remove("late");
    }
  }

  //if the buses are not available
  function display404(result) {
    const empty = document.getElementById("notFound");

    if (result == true) {
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
    }
  }

  //displaying bus information
  const displayBusses = async (e) => {
    validRouteNum(routeNum);

    if (e) {
      e.preventDefault();
    }
    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/loadBus/${routeNum}`
      );

      if (res.data.length > 0) {
        setDisplayInfo(res.data);
        display404(false);
      } else {
        setDisplayInfo([]);
        console.log("No buses found");
        display404(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mainContainer">
      <div className="leftDiv">
        <h1 style={{ marginBottom: "35px" }}>Active Buses</h1>

        <form onSubmit={displayBusses}>
          <div className="search-container">
            <input
              id="routeInput"
              type="text"
              className="search-box"
              placeholder="Enter route number..."
              value={routeNum}
              onChange={(e) => setRouteNum(e.target.value)}
              required
            />
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>

            <button className="filter-button">
              <svg
                className="filter-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
              </svg>
              Search
            </button>
          </div>
        </form>
        <label className="warningText" id="warningText">
          ⚠️ Please enter a valid integer for the route number
        </label>

        <div id="notFound" className="notfoundDiv">
          <label className="notfoundCode">404</label>
          <label className="notfoundMsg">
            Oops! Looks like no buses are running for this route{" "}
          </label>
        </div>
        {displayInfo.length > 0 &&
          displayInfo.map((bus, index) => (
            <div
              onClick={() => fetchLocation(bus._id)}
              className="busInfoDiv"
              key={bus._id}
            >
              <div className="topRow">
                <p className="busId"> {bus.vehicleNumber}</p>
                <div id="statusBtn" className="status-label">
                  {bus.status}
                </div>
              </div>

              <label className="routeNum" style={{ float: "right" }}>
                {bus.routeNum}
              </label>

              <div className="busInfoText" style={{ textAlign: "left" }}>
                <div className="busType">
                  <p>Type : {bus.type}</p>
                </div>

                <p>
                  <strong>Next Stop:</strong> {bus.nextStop}
                </p>
                <p>
                  <strong>Last Stop:</strong> {bus.previousStop}
                </p>

                <p>
                  <strong>ETA:</strong> {bus.ETA}
                </p>
              </div>
              <div className="busImage">
                <img
                  src={bus.busImage}
                  alt={bus.vehicleNumber}
                  style={{ width: "330px", height: "238px" }}
                />
              </div>
            </div>
          ))}
      </div>

      <div className="rightDiv">
        <BusMap busLocation={busLocation} stops={stops} />
      </div>
    </div>
  );
}

export default SearchRoute;

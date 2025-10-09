import { useEffect, useState } from "react";
import axios from "axios";

import "../../styles/BusStopPage.css"
import BusStopMap from "./BusStopMap";
import OffCanvas from "../OffCanvas";

function BusStopPage({ setStops }) {
  const [stops, setBusStop] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [stopName, setStopName] = useState("");
  const [latitude, setLattitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [editingStopId, setEditingStopId] = useState(null);
  const [editedStopName, setEditedStopName] = useState("");
  const [editedLat, setEditedLat] = useState("");
  const [editedLon, setEditedLon] = useState("");

  //Loading bus stops on rendering
  useEffect(() => {
    const getStops = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Stops/loadStops");
        setBusStop(res.data);
      } catch (err) {
        console.log("Error while fetching bus stop data : User side " + err);
      }
    };

    getStops();
  }, []);

  //Loading bus stop location on click based on the given stop id
  async function loadStops(stopId) {
    const res = await axios.get(
      `http://localhost:8070/Stops/displayStop/${stopId}`
    );

    if (res) {
      console.log("Passing Bus Stop Data : ", res.data);
      setSelectedStop(res.data);
      setStops(res.data);
    } else {
      console.log("Bus stop data not found");
    }
  }

  //Bus stop searching
  async function searchStop(stopName) {
    const res = await axios.get(
      `http://localhost:8070/Stops/searchstop/${stopName}`
    );

    if (res) {
      setBusStop(res.data);
      console.log("Search stop data : ", stops);
    } else {
      console.log("Bus stop not found : For the user side displaying");
    }
  }

  //slide bar handling
  function handleSideBar(status) {
    const sidebar = document.getElementById("sidebar");
    if (status == true) {
      sidebar.classList.add("open");
    } else {
      sidebar.classList.remove("open");
    }
  }

  //adding new bus stops
  const addStop = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8070/Stops/addStop", {
        stopName,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
      });

      setBusStop([...stops, res.data]);
    } catch (err) {
      console.error("Error while adding bus stop : " + err);
    }
  };

  //Deleting bus stop
  const deleteStop = async (stopId) => {
    if (!window.confirm("Are you sure you want to delete this stop?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:8070/Stops/deletestop/${stopId}`
      );

      setBusStop(stops.filter((stop) => stop._id !== stopId));
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      }
      console.log("Error while deleting bus stop " + err);
    }
  };

  //Updating Stop
  const updateStop = async (stopId) => {
    try {
      const res = await axios.put(
        `http://localhost:8070/Stops/updatestop/${stopId}`,
        {
          stopName: editedStopName,
          lat: parseFloat(editedLat),
          lon: parseFloat(editedLon),
        }
      );

      setBusStop(stops.map((stop) => (stop._id === stopId ? res.data : stop)));
      setEditingStopId(null);
      
    } catch (err) {
      console.error("Error updating stop: ", err);
    }
  };

  return (
    <div className="mainContainer">
      <div className="mapContainer">
        <BusStopMap stops={selectedStop} />
      </div>

      <div className="overlay">
        <div className="offCanvas">
          <OffCanvas />
        </div>
        <div className="stopCards">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchStop(searchQuery);
            }}
          >
            <div className="search-container2">
              <input
                id="routeInput"
                type="text"
                className="search-box2"
                placeholder="Enter Stop Name..."
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
          {stops.length > 0 &&
            stops.map((stop, index) => (
              <div className="stopinfoDiv" key={index}>
                {editingStopId === stop._id ? (
                  
                  //Editing Part
                  <div>
                    <input
                      className = "updateInput"
                      value={editedStopName}
                      onChange={(e) => setEditedStopName(e.target.value)}
                    />
                    <input
                      className = "updateInput"
                      value={editedLat}
                      onChange={(e) => setEditedLat(e.target.value)}
                    />
                    <input
                      className = "updateInput"
                      value={editedLon}
                      onChange={(e) => setEditedLon(e.target.value)}
                    />
                    <button className = "addButton" onClick={() => updateStop(stop._id)} style = {{marginRight : "8px", backgroundColor : "#8cdb66"}}>Save</button>
                    <button className = "addButton" onClick={() => setEditingStopId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                 
                 //Displaying part
                  <div onClick={() => loadStops(stop._id)}>
                    <label className="stopName">{stop.stopName}</label>
                    <br />
                    <label className="stopInfo">Lat : {stop.lat}</label>
                    <br />
                    <label className="stopInfo">Lon : {stop.lon}</label><br/>

                     <div className = "edDelBtnContainer">
                    <button
                    className="editBtn"
                      onClick={() => {
                        setEditingStopId(stop._id);
                        setEditedStopName(stop.stopName);
                        setEditedLat(stop.lat);
                        setEditedLon(stop.lon);
                      }}
                    >
                      <img 
                      style={{ width: "25px", height: "25px" }}
                      src = "/images/editicon.png"/>
                    </button>

                    <button
                      className="deleteBtn"
                      onClick={() => deleteStop(stop._id)}
                    >
                      <img
                        style={{ width: "25px", height: "25px" }}
                        src="/images/trash.png"
                      />
                    </button>
                  </div>
                  
                  </div>
                )}
              </div>
            ))}
        </div>
        <div id="sidebar" className="sidebar">
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

          <label className="addbusTopic">Add New Stop</label>
          <form onSubmit={addStop}>
            <label className="inputLabel">Stop Name</label>

            <br />
            <input
              className="inputField"
              type="text"
              onChange={(e) => setStopName(e.target.value)}
              placeholder="Stop Name"
              required
            />
            <br />

            <label className="inputLabel">Latitude</label>
            <br />
            <input
              className="inputField"
              type="text"
              onChange={(e) => setLattitude(e.target.value)}
              placeholder="Latitude"
              required
            />
            <br />

            <label className="inputLabel">Longitude</label>
            <br />
            <input
              className="inputField"
              type="text"
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              required
            />
            <br />

            <button className="inputBtn" type="submit">
              <img
                className="submitImage"
                src="/images/check.png"
                alt="Submit btn image"
              />
            </button>
          </form>
        </div>
        <button className="slideBtn" onClick={() => handleSideBar(true)}>
          <img className="slideImg" src="/images/addBusIcon.png" alt="check" />
        </button>
      </div>
    </div>
  );
}

export default BusStopPage;

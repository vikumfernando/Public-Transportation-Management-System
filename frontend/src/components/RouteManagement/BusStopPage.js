import { useEffect, useState } from "react";
import axios from "axios";

import "../../styles/BusStopPage.css";
import BusStopMap from "./BusStopMap";
import OffCanvas from "../OffCanvas";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const sidebar = document.getElementById("sidebar");
    try {
      const res = await axios.post("http://localhost:8070/Stops/addStop", {
        stopName,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
      });

      setBusStop([...stops, res.data]);

      //resetting input fields
      setStopName("");
      setLattitude("");
      setLongitude("");
      document.getElementById("stopInput").value = "";
      document.getElementById("latInput").value = "";
      document.getElementById("lonInput").value = "";
      sidebar.classList.remove("open");

      toast.success(`Bus stop registered successfully`, {
        position: "bottom-right",
        autoClose: 4000,
      });
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

  //Input validation
  function validateStopName(stopName, id) {
    const input = document.getElementById(id);
    const isValid = /^[A-Za-z\s]+$/.test(stopName.trim());
    const submitBtn = document.getElementById("inputBtn");

    const warningMsg = document.getElementById("warningText");

    if (isValid) {
      input.classList.remove("invalid");
      submitBtn.disabled = false;
      submitBtn.style.cursor = "pointer";
      input.classList.add("valid");
      warningMsg.classList.remove("invalid");
    } else {
      console.log("Invalid value detected");
      input.classList.add("invalid");
      warningMsg.classList.add("invalid");
      submitBtn.disabled = true;
      submitBtn.style.cursor = "not-allowed";
    }
  }

  //validating latitude and longitude
  function validateLat(lat, id) {
    const input = document.getElementById(id);
    const isValid = /^-?\d+(\.\d+)?$/.test(lat.trim());
    const submitBtn = document.getElementById("inputBtn");
    const warningMsg = document.getElementById("warningText2");

    if (isValid) {
      input.classList.remove("invalid");
      submitBtn.disabled = false;
      submitBtn.style.cursor = "pointer";
      input.classList.add("valid");
      warningMsg.classList.remove("invalid");
    } else {
      console.log("Invalid value detected");
      input.classList.add("invalid");
      warningMsg.classList.add("invalid");
      submitBtn.disabled = true;
      
      submitBtn.style.cursor = "not-allowed";
    }
  }

  function validateLon(lat, id) {
    const input = document.getElementById(id);
    const isValid = /^-?\d+(\.\d+)?$/.test(lat.trim());
    const submitBtn = document.getElementById("inputBtn");
    const warningMsg = document.getElementById("warningText3");

    if (isValid) {
      input.classList.remove("invalid");
      submitBtn.disabled = false;
      warningMsg.classList.remove("invalid");
      submitBtn.style.cursor = "pointer";
    } else {
      console.log("Invalid value detected");
      input.classList.add("invalid");
      warningMsg.classList.add("invalid");
      submitBtn.disabled = true;
      submitBtn.style.cursor = "not-allowed";
  }}

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
                      className="updateInput"
                      value={editedStopName}
                      onChange={(e) => setEditedStopName(e.target.value)}
                    />
                    <input
                      className="updateInput"
                      value={editedLat}
                      onChange={(e) => setEditedLat(e.target.value)}
                    />
                    <input
                      className="updateInput"
                      value={editedLon}
                      onChange={(e) => setEditedLon(e.target.value)}
                    />
                    <button
                      className="addButton"
                      onClick={() => updateStop(stop._id)}
                      style={{ marginRight: "8px", backgroundColor: "#8cdb66" }}
                    >
                      Save
                    </button>
                    <button
                      className="addButton"
                      onClick={() => setEditingStopId(null)}
                    >
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
                    <label className="stopInfo">Lon : {stop.lon}</label>
                    <br />

                    <div className="edDelBtnContainer">
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
                          src="/images/editicon.png"
                        />
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
              id="stopInput"
              onChange={(e) => {
                setStopName(e.target.value);
                validateStopName(e.target.value, e.target.id);
              }}
              placeholder="Stop Name"
              required
            />

            <label
              className="warningText2"
              id="warningText"
              style={{ marginTop: "-10px" }}
            >
              ⚠️ Please enter a valid bus stop name
            </label>
            <br />

            <label className="inputLabel">Latitude</label>
            <br />

            <input
              id="latInput"
              className="inputField"
              type="text"
              onChange={(e) => {
                validateLat(e.target.value, e.target.id);
                setLattitude(e.target.value);
              }}
              placeholder="Latitude"
              required
            />
            <label
              className="warningText2"
              id="warningText2"
              style={{ marginTop: "-10px" }}
            >
              ⚠️ Please enter a valid value for latitude
            </label>
            <br />

            <label className="inputLabel">Longitude</label>
            <br />
            <input
              id="lonInput"
              className="inputField"
              type="text"
              onChange={(e) => {
                setLongitude(e.target.value);
                validateLon(e.target.value, e.target.id);
              }}
              placeholder="Longitude"
              required
            />

            <label
              className="warningText2"
              id="warningText3"
              style={{ marginTop: "-10px" }}
            >
              ⚠️ Please enter a valid value for longitude
            </label>
            <br />

            <button className="inputBtn" type="submit" id="inputBtn">
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

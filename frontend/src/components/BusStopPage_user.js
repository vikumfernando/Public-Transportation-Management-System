import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/BusStopPage.css";
import BusStopMap from "../components/BusStopMap";

function BusStopPageUser({ setStops }) {
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

  //Loading bus stop location on click, based on the given stop id
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

  return (
    <div className="mainContainer">

      <div className="mapContainer">
        <BusStopMap stops={selectedStop} />
      </div>

      <div className="overlay">
       
        <div className="stopCards" style = {{marginLeft : "22px"}}>
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
                <div onClick={() => loadStops(stop._id)}>
                  <label className="stopName">{stop.stopName}</label>
                  <br />
                  <label className="stopInfo">Lat : {stop.lat}</label>
                  <br />
                  <label className="stopInfo">Lon : {stop.lon}</label>
                  <br />
                </div>
              </div>
            ))}
        </div>
        
      </div>
    </div>
  );
}

export default BusStopPageUser;

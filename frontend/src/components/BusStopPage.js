import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/BusStopPage.css";

function BusStopPage({ setStops }) {
  const [stops, setBusStop] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);

  //Loading bus stops on rendering
  useEffect(() => {
    const getStops = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Stops/loadStops");
        setBusStop(res.data);
      } catch (err) {
        console.log("Error while fetching bus stop data : " + err);
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
      console.log("Passing Bus Stop Data : " + res.data);
      setSelectedStop(res.data);
      setStops(res.data);
    } else {
      console.log("Bus stop data not found");
    }
  }

  return (
    
    
    <div className="routeContainer">
      {stops.length > 0 &&
        stops.map((stop, index) => (
          <div className="routeinfoDiv">
            <div onClick={() => loadStops(stop._id)} key={index}>
              <p>Stop Id : {stop._id}</p>
              <p>Route Name : {stop.stopName}</p>
            </div>
          </div>
        ))}
    </div> 

   

  )
}

export default BusStopPage;
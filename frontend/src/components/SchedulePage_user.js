import { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/SchedulesPage.css";

function SchedulesPageUser() {
  const [buses, setBuses] = useState([]);
  const [routeNum, setRouteNum] = useState("");

  // For new schedule registering
  const [dropdownRoutes, setDropdownRoutes] = useState([]);
  const [scheduleRoute, setScheduleRoute] = useState("");
  const [dateType, setDateType] = useState("weekday");

  const [dropdownStops, setDropdownStops] = useState([]);

  // Each stop has stopId + time object
  const [stopsData, setStopsData] = useState([
    { stopId: "", time: { hour: 8, minute: 0, period: "AM" } },
  ]);

  // Load buses, routes, and stops
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Busses/loadBuses");
        setBuses(res.data);
      } catch (err) {
        console.error("Error loading buses: ", err);
      }
    };

    const getRoutes = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Routes/loadroutes");
        setDropdownRoutes(res.data);
      } catch (err) {
        console.error("Error loading routes: ", err);
      }
    };

    const getStops = async () => {
      try {
        const res = await axios.get("http://localhost:8070/Stops/loadStops");
        setDropdownStops(res.data);
      } catch (err) {
        console.error("Error loading stops: ", err);
      }
    };

    loadBuses();
    getRoutes();
    getStops();
  }, []);

  // Search bus by route number
  const searchBus = async (routeNum) => {
    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/loadBus/${routeNum}`
      );
      setBuses(res.data);
    } catch (err) {
      console.error("Bus data not found: ", err);
    }
  };


  // Update time with validation
  const updateTime = (index, key, value) => {
    const updated = [...stopsData];
    let timeObj = { ...updated[index].time, [key]: value };

    if (key === "hour") {
      if (value < 1) timeObj.hour = 12;
      if (value > 12) timeObj.hour = 1;
    }
    if (key === "minute") {
      if (value < 0) timeObj.minute = 59;
      if (value > 59) timeObj.minute = 0;
    }

    updated[index].time = timeObj;
    setStopsData(updated);
  };

  // Convert 12-hour time to HH.MM string for backend
  const formatTime = ({ hour, minute, period }) => {
    let h =
      period === "PM" && hour < 12
        ? hour + 12
        : period === "AM" && hour === 12
        ? 0
        : hour;
    const mm = minute < 10 ? "0" + minute : minute;
    return `${h}.${mm}`;
  };

  const generatePdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Bus Schedules", 14, 22);

    const columns = [
      "Vehicle Number",
      "Stop Name",
      "Time of Arrival",
      "Day Type",
    ];

    const rows = buses.map((bus) => {
      const stopsStr = bus.route.map((s) => s.stopName).join("\n");
      const timesStr = bus.schedule.stopSchedules
        .map((s) => s.expectedArrival)
        .join("\n");

      return [bus.vehicleNumber, stopsStr, timesStr, bus.schedule.dayType];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100] },
      theme: "grid",
    });

    doc.save("schedules.pdf");
  };

  return (
    <div>

      {/* Bus Table */}
      <div className="tableContainer">
    
        <div className="btnContainer">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchBus(routeNum);
            }}
          >
            <div className="search-container3">
              <input
                id="routeInput"
                type="text"
                className="search-box2"
                placeholder="Enter Route Number..."
                onChange={(e) => setRouteNum(e.target.value)}
                required
              />
              <button className="filter-button3">
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

          <div className="pdfBtnContainer">
            <button
              style={{ backgroundColor: "#8cdb66", color: "white" }}
              className="pdfBtn"
              onClick={generatePdf}
            >
              <img
               src = "/images/downloadicon.png"
               style = {{width : "25px", height : "25px"}}/>
            </button>
          </div>

        </div>

        <table className="tableFormat">
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Stop Name</th>
              <th>Time Of Arrival</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus._id}>
                <td>{bus.vehicleNumber}</td>
                <td>
                  {bus.route.map((stop, i) => (
                    <div key={i}>{stop.stopName}</div>
                  ))}
                </td>
                <td>
                  {bus.schedule.stopSchedules.map((s, i) => (
                    <div key={i}>{s.expectedArrival}</div>
                  ))}
                </td>
                <td>{bus.schedule.dayType}</td>
                
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchedulesPageUser;

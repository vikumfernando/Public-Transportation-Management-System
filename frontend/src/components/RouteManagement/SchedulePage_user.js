import { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/SchedulesPage.css";
import "../../styles/searchRoute.css";

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
    validRouteNum(routeNum);

    try {
      const res = await axios.get(
        `http://localhost:8070/Busses/loadBus/${routeNum}`
      );
      setBuses(res.data);
    } catch (err) {
      console.error("Bus data not found: ", err);
    }
  };

  // Generate PDF of the bus schedules

  /*
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

  */

  const generatePdf = () => {
    const doc = new jsPDF();

    const logoImg = "/images/siteLogo.png";
    const imgProps = doc.getImageProperties(logoImg);

    doc.addImage(
      logoImg,
      "PNG",
      14, // x
      10, // y
      30, // width
      (imgProps.height * 30) / imgProps.width // height
    );

    
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    doc.setFontSize(10);
    doc.text("Company: ECO Transit", 14, 45);
    doc.text("Phone: +94 77 344 2341", 14, 50);
    doc.text("Email: ecotransit@gmail.com", 14, 55);
    doc.text(`Date: ${dateStr}`, 160, 15);  // adjust X for alignment if needed
    doc.text(`Time: ${timeStr}`, 160, 20);


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
      startY: 65,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100] },
      theme: "grid",
    });

    doc.save("schedules.pdf");
  };

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

            <label
              className="warningText"
              id="warningText"
              style={{ marginTop: "10px" }}
            >
              ⚠️ Please enter a valid integer for the route number
            </label>
          </form>

          <div className="pdfBtnContainer">
            <button
              style={{ backgroundColor: "#8cdb66", color: "white" }}
              className="pdfBtn"
              onClick={generatePdf}
            >
              <img
                src="/images/downloadicon.png"
                style={{ width: "25px", height: "25px" }}
              />
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

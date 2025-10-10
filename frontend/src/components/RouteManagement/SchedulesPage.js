import { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import OffCanvas from "../OffCanvas";

import "../../styles/SchedulesPage.css";

function SchedulesPage() {
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

  // Add/remove stops dynamically
  const addStop = () => {
    setStopsData((prev) => [
      ...prev,
      { stopId: "", time: { hour: 8, minute: 0, period: "AM" } },
    ]);
  };

  const removeStop = (index) => {
    setStopsData((prev) => prev.filter((_, i) => i !== index));
  };

  // Update stopId
  const handleStopChange = (index, value) => {
    const updated = [...stopsData];
    updated[index].stopId = value;
    setStopsData(updated);
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

  // Convert 12-hour time to "HH.MM" string for backend
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

  // Submit new schedule
  const addSchedule = async (e) => {
    e.preventDefault();

    try {
      const stopSchedules = stopsData.map((s) => ({
        stopId: s.stopId,
        expectedArrival: formatTime(s.time),
        expectedDeparture: formatTime(s.time),
      }));

      const res = await axios.post(
        "http://localhost:8070/Schedules/addschedule",
        {
          routeId: scheduleRoute,
          dayType: dateType,
          stopSchedules,
        }
      );

      console.log("Schedule added:", res.data);
      alert("Schedule added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding schedule");
    }
  };

  function handlePopup(status) {
    const popup = document.getElementById("popupcontainer");

    if (status == true) {
      popup.classList.add("open");
    } else {
      popup.classList.remove("open");
    }
  }

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
      {/* Popup Form */}
      <div className="popupContainer" id="popupcontainer">
        <div className="popupBox">

          <form onSubmit={addSchedule}>
            <div className="formContainer">

              {/* Left side */}

              <div className="leftSide">
                <h1 style={{ color: "white" }}>Add new Schedule</h1>

                <label className="topicLbl" style={{ marginTop: "20px" }}>
                  Select Route
                </label>
                <br />
                <select
                  style={{ fontSize: "18px", marginTop: "12px" }}
                  className="dropdown-select"
                  onChange={(e) => setScheduleRoute(e.target.value)}
                  required
                >
                  <option value="">Select Route Number</option>
                  {dropdownRoutes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeNum} {route.routeName}
                    </option>
                  ))}
                </select>

                <label className="topicLbl" style={{ marginTop: "20px" }}>
                  Select Day Type
                </label>
                <select
                  style={{ fontSize: "18px", marginTop: "12px" }}
                  className="dropdown-select"
                  onChange={(e) => setDateType(e.target.value)}
                >
                  <option value="weekday">Weekday</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>

              {/* Right side */}

              <div className="rightSide">
                <button
                  onClick={() => handlePopup(false)}
                  className="closeBtn"
                  type="button"
                >
                  <img
                    className="closeImg"
                    src="/images/closeBtn.png"
                    alt="Submit btn image"
                    style={{ marginBottom: "142px", marginLeft: "32px" }}
                  />
                </button>
                <label
                  className="topicLbl"
                  style={{ marginTop: "20px", marginBottom: "12px" }}
                >
                  Select Halts & Times
                </label>
                {stopsData.map((s, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      className="dropdown-select"
                      style={{
                        fontSize: "16px",
                        marginRight: "10px",
                        width: "200px",
                      }}
                      value={s.stopId}
                      onChange={(e) => handleStopChange(index, e.target.value)}
                      required
                    >
                      <option value="">Select Stop</option>
                      {dropdownStops.map((stop) => (
                        <option key={stop._id} value={stop._id}>
                          {stop.stopName}
                        </option>
                      ))}
                    </select>

                    <input
                      className="timeInput"
                      type="number"
                      value={s.time.hour}
                      onChange={(e) =>
                        updateTime(index, "hour", parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max="12"
                      style={{
                        width: "60px",
                        marginRight: "5px",
                        marginLeft: "20px",
                      }}
                      required
                    />
                    <span
                      style={{
                        color: "white",
                        fontWeight: "500",
                        marginTop: "-15px",
                      }}
                    >
                      :
                    </span>
                    <input
                      className="timeInput"
                      type="number"
                      value={s.time.minute}
                      onChange={(e) =>
                        updateTime(
                          index,
                          "minute",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      max="59"
                      style={{
                        width: "60px",
                        marginLeft: "5px",
                        marginRight: "12px",
                      }}
                      required
                    />
                    <select
                      className="dropdown-select"
                      value={s.time.period}
                      onChange={(e) =>
                        updateTime(index, "period", e.target.value)
                      }
                      style={{ marginRight: "10px", width: "82px" }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    <button
                      className="removeStop"
                      type="button"
                      onClick={() => removeStop(index)}
                    >
                      <img
                        style={{
                          width: "40px",
                          height: "50px",
                          marginTop: "-15px",
                        }}
                        src="/images/removeIcon.png"
                      />
                    </button>
                  </div>
                ))}
                <button
                  style={{
                    backgroundColor: "#8cdb66",
                    color: "white",
                    fontWeight4: "400",
                  }}
                  type="button"
                  onClick={addStop}
                  className="addButton"
                >
                  Add More
                </button>
              </div>
            </div>
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
      </div>

      {/* Bus Table */}
      <div className="tableContainer">
        <div className="offCanvas" style={{ marginLeft: "-55px" }}>
          <OffCanvas />
        </div>

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

          <div className="addBtnContainer">
            <button
              style={{ backgroundColor: "#8cdb66", color: "white"}}
              onClick={() => handlePopup(true)}
              className="addBtn"
            >
              <img
               src = "/images/addBusIcon.png"
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
              <th>Edit</th>
              <th>Delete</th>
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
                <td>
                  <button>Edit</button>
                </td>
                <td>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchedulesPage;

import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/BusesPage.css";

import "../../styles/SchedulesPage.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BusesPage() {
  const [buses, setBuses] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [dropdownRoutes, setDropdownRoutes] = useState([]);
  const [scheduleRoute, setScheduleRoute] = useState("");

  const [dropdownschedules, setDropdownschedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");

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
        console.log("Routes data: ", res.data);
      } catch (err) {
        console.error("Error loading routes: ", err);
      }
    };

    const loadSchedules = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8070/Schedules/loadschedules"
        );
        setDropdownschedules(res.data);
        console.log("Schedules data: ", res.data);
      } catch (err) {
        console.error("Error while loading schedules : " + err);
      }
    };

    loadBuses();
    getRoutes();
    loadSchedules();
  }, []);

  //deleting bus
  const deleteBus = async (busId) => {
    if (!window.confirm("Are you sure you want to remove this bus?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:8070/Busses/deletebus/${busId}`
      );

      setBuses(buses.filter((bus) => bus._id !== busId));
      toast.success(`Bus removed successfully`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      }
      console.error("Error while removing bus " + err);
      toast.success(`Failed to remove Bus`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    }
  };

  //Registering new buses
  const addBus = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8070/Busses/addBus", {
        vehicleNumber: e.target.vehicleNumber.value,
        vehicleType: e.target.type.value,
        avlSeats: e.target.seatCount.value,
        route: e.target.route.value,
        schedule: e.target.schedule.value,
        busImage: "/images/bus.png", // Default bus image
      });

      toast.success(`Bus registered successfully`, {
        position: "bottom-right",
        autoClose: 4000,
      });
      handlePopup(false);
      // Reload buses
      const res = await axios.get("http://localhost:8070/Busses/loadBuses");
      setBuses(res.data);
    } catch (err) {
      toast.error(`Bus already assigned with the selected schedule`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    }
  };

  //searching bus in the admin table
  async function searchBus(vehicleNum) {
    const res = await axios.get(
      `http://localhost:8070/Busses/searchBus/${vehicleNum}`
    );

    if (res) {
      setBuses([res.data]);
      console.log("Searched Bus data : ", buses);
    } else {
      console.log("Bus not found");
    }
  }

  //Generating pdfs for the bus information
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

    doc.setFontSize(10);
    doc.text("Company: ECO Transit", 14, 45);
    doc.text("Phone: +94 77 344 2341", 14, 50);
    doc.text("Email: ecotransit@gmail.com", 14, 55);

    const columns = [
      "Vehicle Number",
      "Vehicle Type",
      "Num. of Seats",
      "Current Latitude",
      "Current Longitude",
    ];

    const rows = buses.map((bus) => [
      bus.vehicleNumber,
      bus.type,
      bus.seatCount,
      bus.lat,
      bus.lon,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 65,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100] },
      theme: "grid",
    });

    doc.save("BusData.pdf");
  };

  function handlePopup(status) {
    const popup = document.getElementById("popupcontainer");

    if (status == true) {
      popup.classList.add("open");
    } else {
      popup.classList.remove("open");
    }
  }

  return (
    <div>
      {/*Pop up form to add buses*/}
      <div className="popupContainer" id="popupcontainer" style = {{marginTop: "0"}}>
        <div className="popupBox">
          <form
            onSubmit={async (e) => {
              await addBus(e);
            }}
          >
            <div className="formContainer">
              <div className="leftSide">
                <h1 style={{ color: "white" }}>Add new Bus</h1>

                <div>
                  <label className="topicLbl">Vehicle Number</label>
                  <input
                    className="inputField2"
                    type="text"
                    name="vehicleNumber"
                    required
                  />
                </div>

                <div>
                  <label className="topicLbl">Bus Type</label>
                  <input
                    className="inputField2"
                    type="text"
                    name="type"
                    required
                  />
                </div>

                <div>
                  <label className="topicLbl">Number of Seats:</label>
                  <input
                    className="inputField2"
                    type="number"
                    name="seatCount"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="rightSide">
                <div>
                  <label  className="topicLbl">Route</label><br />
                  <select
                   className="dropdown-select"
                    name="route"
                    required
                    onChange={(e) => setScheduleRoute(e.target.value)}
                    value={scheduleRoute}
                  >
                    <option value="">Select Route</option>
                    {dropdownRoutes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeNum} - {route.routeName}
                      </option>
                    ))}
                  </select>

                  {scheduleRoute &&
              (() => {
                const selectedRoute = dropdownRoutes.find(
                  (r) => r._id === scheduleRoute
                );
                if (
                  selectedRoute &&
                  selectedRoute.busStops &&
                  selectedRoute.busStops.length > 0
                ) {
                  const firstStop = selectedRoute.busStops[0];
                  return (
                    <div style={{ margin: "10px 0" }}>
                      <strong>Route Number:</strong> {selectedRoute.routeNumber}{" "}
                      <br />
                      <strong>First Bus Stop Start Time:</strong>{" "}
                      {firstStop.startTime}
                    </div>
                  );
                }
                return null;
              })()}
            <div>
              <label  className="topicLbl">Schedule</label>
              <select className="dropdown-select" name="schedule" required>
                <option value="">Select Schedule</option>
                {dropdownschedules.map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>
                    {schedule.routeId.routeName} {" : "}
                    {schedule.stopSchedules[0].expectedArrival}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "10px" }}>
              <button
               className="addButton"
                type="submit"
                style={{ backgroundColor: "#8cdb66", color: "white" }}
              >
                Add Bus
              </button>
              <button
               className="addButton"
               style = {{backgroundColor: "#ff4d4d", color: "white", marginLeft: "10px" }}
                type="button"
                onClick={() => handlePopup(false)}
              >
                Cancel
              </button>
            </div>
                </div>
              </div>
            </div>

            
            </div>
            
          </form>
        </div>
      </div>

      {/*Searching bar */}
      <div className="search-container2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchBus(searchQuery);
          }}
        >
          <div className="search-container2">
            <input
              style={{ margin: "10px 0px 21px 30px", width: "15%" }}
              id="routeInput"
              type="text"
              className="search-box2"
              placeholder="Enter Vehicle Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />

            <button
              style={{ marginTop: "10px", width: "65px" }}
              className="filter-button2"
            >
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
      </div>

      <div className="btnContainer" style={{ marginTop: "-10px" }}>
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

        <div className="addBtnContainer">
          <button
            style={{ backgroundColor: "#8cdb66", color: "white" }}
            onClick={() => handlePopup(true)}
            className="addBtn"
          >
            <img
              src="/images/addBusIcon.png"
              style={{ width: "25px", height: "25px" }}
            />
          </button>
        </div>
      </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  Vehicle
                  <br /> Number
                </th>
                <th>
                  Vehicle <br />
                  Type
                </th>
                <th>Seats</th>
                <th>
                  Previous <br />
                  Stop
                </th>
                <th>
                  Next <br />
                  Stop
                </th>
                <th>Cordinates</th>
                <th>Image</th>
                <th>Delete</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody id="vehicleTableBody">
              {buses.map((bus) => (
                <tr key={bus._id}>
                  <td>{bus.vehicleNumber}</td>
                  <td>{bus.type}</td>
                  <td>{bus.seatCount}</td>
                  <td>{bus.previousStop}</td>
                  <td>{bus.nextStop}</td>
                  <td style={{ width: "75px" }}>
                    <img
                      className="locationIcon"
                      src="/images/locationIcon.png"
                    />
                    {bus.lat},{bus.lon}
                  </td>
                  <td>
                    <img className="busImageDiv" src={bus.busImage} />
                  </td>
                  <td>
                    <button
                      className="deleteBtn"
                      onClick={() => deleteBus(bus._id)}
                    >
                      <img
                        style={{ width: "25px", height: "25px" }}
                        src="/images/trash.png"
                      />
                    </button>
                  </td>
                  <td>
                    <button className="deleteBtn">
                      <img
                        style={{ width: "25px", height: "25px" }}
                        src="/images/editicon.png"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BusesPage;

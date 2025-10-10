import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/BusesPage.css";

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
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      }
      console.error("Erro while removing bus " + err);
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

    doc.setFontSize(18);
    doc.text("Bus Information", 14, 22);

    const columns = [
      "Vehicle Number",
      "Vehicle Type",
      "Num. of Seats",
      "Current Latitude",
      "Current Longtitude",
    ];

    const rows = buses.map((bus) => {
      return [bus.vehicleNumber, bus.type, bus.seatCount, bus.lat, bus.lon];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100] },
      theme: "grid",
    });

    doc.save("BusData.pdf");
  };

 

  return (
    <div>
      

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
            //onClick={() => handlePopup(true)}
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

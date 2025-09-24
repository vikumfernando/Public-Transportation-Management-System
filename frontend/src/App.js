import Header from "./components/Header";
import OffCanvas from "./components/OffCanvas";

import SearchRoute from "./components/searchRoute";
import AdminDashboard from "./components/AdminDashboard";

import RoutesPage from "./components/RoutesPage";
import BusStopPage from "./components/BusStopPage";
import SchedulesPage from "./components/SchedulesPage";

import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import UserManagement from "./components/UserManagement";

import BusesPage from "./components/BusesPage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

function App() {
  const [busLocation, setBusLocation] = useState(null);
  const [stops, setStops] = useState([]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Header />
              <SearchRoute
                setBusLocation={setBusLocation}
                setStops={setStops}
                busLocation={busLocation}
                stops={stops}
              />
            </div>
          }
        />
        <Route
          path="/admin"
          element={
            <div>
              <Header />
              <OffCanvas />
              <AdminDashboard />
            </div>
          }
        />

        <Route
          path="/routepage"
          element={
            <div>
              <Header />
              <div style={{ display: "flex" }}>
                <RoutesPage />
              </div>
            </div>
          }
        />

        <Route
          path="/stoppage"
          element={
            <div>
              <Header />
              <BusStopPage setStops={setStops} stops={stops} />
            </div>
          }
        />

        <Route path="/schedulepage" element={
          <div>
            <Header />
            <SchedulesPage />



         </div>
        }>
        </Route>

          <Route
          path="/signup"
          element={<SignUp />}
          />

          <Route
          path="/signin"
          element={<SignIn />}
          />

          <Route
          path="/users"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserManagement />
            </div>
          }
          />

          <Route
          path="/busespage"
          element={
            <div>
              <Header />
              <OffCanvas />
              <BusesPage />

            </div>
          }
          />
      </Routes>
    </Router>
  );
}

export default App;

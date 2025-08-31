import Header from "./components/Header";
import OffCanvas from './components/OffCanvas';

import SearchRoute from "./components/searchRoute";
import AdminDashboard from "./components/AdminDashboard";
import RoutesPage from "./components/RoutesPage";
import RouteMap from "./components/RouteMap";

import BusStopPage from "./components/BusStopPage";
import BusStopMap from "./components/BusStopMap";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';

function App() {

  const [busLocation, setBusLocation] = useState(null);
  const [stops, setStops] = useState([]);
  const [routeStop, setRouteStop] = useState([]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Header />
              <SearchRoute setBusLocation={setBusLocation} setStops={setStops} busLocation = {busLocation} stops = {stops}/>
                  
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
          } />

          <Route
          path="/routepage"
          element={
            <div>
              <Header />
              <OffCanvas />
              <div style={{display:"flex"}}>
                <RoutesPage setRouteStop={setRouteStop}/>
                <RouteMap stops={routeStop}/>
              </div>
            </div>
          } />

          <Route
          path="/stoppage"
          element={
            <div>
              <Header/>
              <OffCanvas/>
              <BusStopPage setStops={setStops}/>
              <BusStopMap stops={stops}/>

            </div>
          } />
      </Routes>
    </Router>
  );
}

export default App;
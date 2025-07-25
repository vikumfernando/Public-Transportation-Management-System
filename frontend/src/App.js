import Header from "./components/Header";
import SearchRoute from "./components/searchRoute";
import BusMap from "./components/BusMap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';

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
              <SearchRoute setBusLocation={setBusLocation} setStops={setStops}/>
              <BusMap busLocation={busLocation} stops={stops} />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
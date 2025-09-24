import Header from "./components/Header";
import OffCanvas from "./components/OffCanvas";

import SearchRoute from "./components/RouteManagement/searchRoute";
import UserBusStop from "./components/RouteManagement/BusStopPage_user";
import UserRoute from "./components/RouteManagement/RoutePage_user";
import UserSchedule from "./components/RouteManagement/SchedulePage_user";

import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";


//Admin components
import AdminDashboard from "./components/AdminDashboard";

import RoutesPage from "./components/RouteManagement/RoutesPage";
import BusStopPage from "./components/RouteManagement/BusStopPage";
import SchedulesPage from "./components/RouteManagement/SchedulesPage";

import UserManagement from "./components/UserManagement";
import UserCreate from "./components/UserCreate";
import UserProfile from "./components/UserProfile";
import UserEditProfile from "./components/UserEditProfile";
import PassengerProfile from "./components/PassengerProfile";

import BusesPage from "./components/RouteManagement/BusesPage";

//Payment components
import Dashboard from "./components/Dashboard";
import SmartCardPage from "./components/SmartCardPage";
import VisaCardPage from "./components/VisaCardPage";
import TopupPage from "./components/TopupPage";
import RechargePage from "./components/RechargePage";
import TransactionsPage from "./components/TransactionsPage";
import RefundPage from "./components/RefundPage";


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

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
          path="/users/create"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserCreate />
            </div>
          }
          />

          <Route
          path="/users/view/:id"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserProfile />
            </div>
          }
          />

          <Route
          path="/users/edit/:id"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserEditProfile />
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

          <Route
          path="/busstops"
          element={
            <div>
              <Header />
              <UserBusStop setStops={setStops} stops={stops} />

            </div>
          }
          />

          <Route
          path="/busroutes"
          element={
            <div>
              <Header />
              <UserRoute/>

            </div>
          }
          />

          <Route
          path="/userschedule"
          element={
            <div>
              <Header />
              <UserSchedule/>
            </div>
          }
          />

          <Route path="/payment" element={
            <div>
              <Header />
              <Dashboard />
            </div>
          } />

          <Route path="/dashboard" element={
            <div>
              <Header />
              <Dashboard />
            </div>} />

          <Route path="/smart-cards" element={
            <div>
              <Header />
              <SmartCardPage />
             </div>
            } />

          <Route path="/visa-cards" element={
            <div>
              <Header />
              <VisaCardPage />
            </div>
          } />

          <Route path="/topup" element={
            <div>
              <Header />
              <TopupPage />
              </div>
            } />

          <Route path="/recharge" element={
            <div>
              <Header />
              <RechargePage />
              </div>
            } />

          <Route path="/transactions" element={
            <div>
              <Header />
              <TransactionsPage />
              </div>
            } />

          <Route path="/refunds" element={<div>
              <Header /><RefundPage /></div>}/>

          <Route
          path="/me"
          element={
            <div>
              <Header />
              <PassengerProfile />
            </div>
          }
          />
          
      </Routes>
    </Router>
  );
}

export default App;

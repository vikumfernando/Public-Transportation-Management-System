import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import LandingPage from "./components/landingPage";

//Admin components
import AdminDashboard from "./components/AdminDashboard";
import RoutesPage from "./components/RouteManagement/RoutesPage";
import BusStopPage from "./components/RouteManagement/BusStopPage";
import SchedulesPage from "./components/RouteManagement/SchedulesPage";

import UserManagement from "./components/UserManagement";
import UserCreate from "./components/UserCreate";
import UserEdit from "./components/UserEdit";
import UserView from "./components/UserView";
import BusesPage from "./components/RouteManagement/BusesPage";

//Payment components
import Dashboard from "./components/Dashboard";
import SmartCardPage from "./components/SmartCardPage";
import VisaCardPage from "./components/VisaCardPage";
import TopupPage from "./components/TopupPage";
import RechargePage from "./components/RechargePage";
import TransactionsPage from "./components/TransactionsPage";
import RefundPage from "./components/RefundPage";
import RevenueDashboard from "./components/RevenueDashboard";

import PassengerProfile from "./components/PassengerProfile";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchPage from "./components/SearchPage";
import BusDetailsPage from "./components/Busdetails";
import SeatLayoutPage from "./components/SeatLayout";
import MyBookings from "./components/MyBookings";

function App() {
  const [busLocation, setBusLocation] = useState(null);
  const [stops, setStops] = useState([]);

  // Global session management to prevent back navigation after signout
  useEffect(() => {
    const handlePopState = (event) => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // Only redirect if trying to access protected routes without session
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/admin', '/dashboard', '/users', '/routes', '/buses', '/schedules', '/busstops', '/payment', '/smart-cards', '/visa-cards', '/topup', '/recharge', '/transactions', '/refunds', '/booking', '/me', '/location'];
      
      if ((!user || !token) && protectedRoutes.some(route => currentPath.startsWith(route))) {
        window.history.replaceState(null, '', '/');
        window.location.href = '/';
      }
    };

    // Add event listener for back button only
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={4000} />

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <LandingPage />
            </div>
          }
        />


        <Route
          path="/location"
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

        <Route
          path="/schedulepage"
          element={
            <div>
              <Header />
              <SchedulesPage />
            </div>
          }
        ></Route>

        <Route path="/signup" element={<SignUp />} />

        <Route path="/signin" element={<SignIn />} />
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
          path="/users/:id"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserView />
            </div>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <div>
              <Header />
              <OffCanvas />
              <UserEdit />
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
              <UserRoute />
            </div>
          }
        />

        <Route
          path="/userschedule"
          element={
            <div>
              <Header />
              <UserSchedule />
            </div>
          }
        />

        <Route
          path="/payment"
          element={
            <div>
              <Header />
              <Dashboard />
            </div>
          }
        />

        <Route
          path="/dashboard"
          element={
            <div>
              <Header />
              <Dashboard />
            </div>
          }
        />

        <Route
          path="/smart-cards"
          element={
            <div>
              <Header />
              <SmartCardPage />
            </div>
          }
        />

        <Route
          path="/visa-cards"
          element={
            <div>
              <Header />
              <VisaCardPage />
            </div>
          }
        />

        <Route
          path="/topup"
          element={
            <div>
              <Header />
              <TopupPage />
            </div>
          }
        />

        <Route
          path="/recharge"
          element={
            <div>
              <Header />
              <RechargePage />
            </div>
          }
        />

        <Route
          path="/transactions"
          element={
            <div>
              <Header />
              <TransactionsPage />
            </div>
          }
        />

        <Route
          path="/refunds"
          element={
            <div>
              <Header />
              <RefundPage />
            </div>
          }
        />

        <Route
          path="/revenue-dashboard"
          element={
            <div>
              <Header />
              <RevenueDashboard />
            </div>
          }
        />

        <Route
          path="/booking/search"
          element={
            <div>
              <Header />
              <SearchPage />
            </div>
          }
        />

        <Route
          path="/bus-details/:busId"
          element={
            <div>
              <Header />
              <BusDetailsPage />
            </div>
          }
        />

        <Route
          path="/booking/seat-layout/:busId"
          element={
            <div>
              <Header />
              <SeatLayoutPage />
            </div>
          }
        />

        <Route
          path="/booking/mybookings"
          element={
            <div>
              <Header />
              <MyBookings />
            </div>
          }
        />

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

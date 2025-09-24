import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/header.css"; 

function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const dropdownEnter = (dropdown) => setActiveDropdown(dropdown);
  const dropdownLeave = () => setActiveDropdown(null);
  const closeMobileMenu = () => setActiveDropdown(null);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">TH</div>Transport Hub
        </Link>

        {/* Navigation Menu */}
        <ul className="nav-menu" id="navMenu">
          {/* Location Service */}
          <li
            className="nav-item dropdown"
            onMouseEnter={() => dropdownEnter("location")}
            onMouseLeave={dropdownLeave}
          >
            <Link to="#" className="nav-link" onClick={closeMobileMenu}>
              Location Service
            </Link>
            <div
              className={`dropdown-menu ${
                activeDropdown === "location" ? "show" : ""
              }`}
            >
              <Link to="/" className="dropdown-item" onClick={closeMobileMenu}>
                Live Location
              </Link>
              <Link
                to="/fleet-management"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Schedule
              </Link>
              <Link
                to="/real-time-tracking"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 3
              </Link>
              <Link
                to="/analytics-dashboard"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 4
              </Link>
            </div>
          </li>

          {/* Payment (replaced with your links) */}
          <li
            className="nav-item dropdown"
            onMouseEnter={() => dropdownEnter("payment")}
            onMouseLeave={dropdownLeave}
          >
            <Link to="#" className="nav-link" onClick={closeMobileMenu}>
              Payment
            </Link>
            <div
              className={`dropdown-menu ${
                activeDropdown === "payment" ? "show" : ""
              }`}
            >
              <Link
                to="/dashboard"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/smart-cards"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Smart Cards
              </Link>
              <Link
                to="/visa-cards"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Visa Cards
              </Link>
              <Link
                to="/topup"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Transport Pay
              </Link>
              <Link
                to="/recharge"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Recharge
              </Link>
              <Link
                to="/transactions"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Transactions
              </Link>
              <Link
                to="/refunds"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Refunds
              </Link>
            </div>
          </li>

          {/* Booking Service */}
          <li
            className="nav-item dropdown"
            onMouseEnter={() => dropdownEnter("booking")}
            onMouseLeave={dropdownLeave}
          >
            <Link to="#" className="nav-link" onClick={closeMobileMenu}>
              Booking Service
            </Link>
            <div
              className={`dropdown-menu ${
                activeDropdown === "booking" ? "show" : ""
              }`}
            >
              <Link
                to="/documentation"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                Seat Booking
              </Link>
              <Link
                to="/case-studies"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 2
              </Link>
              <Link
                to="/blog"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 3
              </Link>
              <Link
                to="/support"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 4
              </Link>
            </div>
          </li>

          {/* Test 4 */}
          <li
            className="nav-item dropdown"
            onMouseEnter={() => dropdownEnter("test4")}
            onMouseLeave={dropdownLeave}
          >
            <Link to="#" className="nav-link" onClick={closeMobileMenu}>
              Test 4
            </Link>
            <div
              className={`dropdown-menu ${
                activeDropdown === "test4" ? "show" : ""
              }`}
            >
              <Link
                to="/about-us"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 1
              </Link>
              <Link
                to="/careers"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 2
              </Link>
              <Link
                to="/partners"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 3
              </Link>
              <Link
                to="/contact"
                className="dropdown-item"
                onClick={closeMobileMenu}
              >
                sub 4
              </Link>
            </div>
          </li>
        </ul>

        {/* User Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <span className="welcome-text">Welcome, {user.firstName}!</span>
              <button className="signout-btn" onClick={handleSignOut}>
                SIGN OUT
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/signin" className="signin-btn">
                SIGN IN
              </Link>
              <Link to="/signup" className="signup-btn">
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;

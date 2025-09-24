import '../styles/header.css';
import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const dropdownEnter = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    const dropdownLeave = () => {
        setActiveDropdown(null);
    };

    const closeMobileMenu = () => {
        setActiveDropdown(null);
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                   <img style = {{width : "115px", height : "97px"}} src = "/images/siteLogo.png"/>
                </Link>

                <ul className= "nav-menu" id="navMenu">
                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test1')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>Location Service</Link>
                        
                        <div className={`dropdown-menu ${activeDropdown === 'test1' ? 'show' : ''}`}>
                            <Link to="/" className="dropdown-item" onClick={closeMobileMenu}>
                                Live Location
                            </Link>
                            <Link to="/fleet-management" className="dropdown-item" onClick={closeMobileMenu}>
                                Schedule 
                            </Link>
                            <Link to="/real-time-tracking" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 3
                            </Link>
                            <Link to="/analytics-dashboard" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 4
                            </Link>
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test2')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>
                            Payment
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test2' ? 'show' : ''}`}>
                            <Link to="/bus-transit" className="dropdown-item" onClick={closeMobileMenu}>
                                My Wallet
                            </Link>
                            <Link to="/rail-systems" className="dropdown-item" onClick={closeMobileMenu}>
                                NFC Card Service
                            </Link>
                            <Link to="/multi-modal-transport" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 3
                            </Link>
                            <Link to="/smart-cities" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 4
                            </Link>
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test3')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>
                            Booking Service
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test3' ? 'show' : ''}`}>
                            <Link to="/documentation" className="dropdown-item" onClick={closeMobileMenu}>
                                Seat Booking
                            </Link>
                            <Link to="/case-studies" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 2
                            </Link>
                            <Link to="/blog" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 3
                            </Link>
                            <Link to="/support" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 4
                            </Link>
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test4')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>
                            Test 4
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test4' ? 'show' : ''}`}>
                            <Link to="/about-us" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 1
                            </Link>
                            <Link to="/careers" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 2
                            </Link>
                            <Link to="/partners" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 3
                            </Link>
                            <Link to="/contact" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 4
                            </Link>
                        </div>
                    </li>
                </ul>

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
                            <Link to="/signin" className="signin-btn">SIGN IN</Link>
                            <Link to="/signup" className="signup-btn">SIGN UP</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Header;
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
                        <Link to="/" className="nav-link" onClick={closeMobileMenu}>Location Service</Link>
                        
                        <div className={`dropdown-menu ${activeDropdown === 'test1' ? 'show' : ''}`}>
                            <Link to="/" className="dropdown-item" onClick={closeMobileMenu}>
                                Live Location
                            </Link>
                            
                            <Link to="/busstops" className="dropdown-item" onClick={closeMobileMenu}>
                                Bus Stops
                            </Link>
                            
                            <Link to="/busroutes" className="dropdown-item" onClick={closeMobileMenu}>
                                Bus Routes
                            </Link>
                            
                            <Link to="/userschedule" className="dropdown-item" onClick={closeMobileMenu}>
                                Schedule 
                            </Link>
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test2')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="/payment" className="nav-link" onClick={closeMobileMenu}>
                            Payment
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test2' ? 'show' : ''}`}>
                            <Link to="/smart-cards" className="dropdown-item" onClick={closeMobileMenu}>
                                NFC Card 
                            </Link>
                            <Link to="/visa-cards" className="dropdown-item" onClick={closeMobileMenu}>
                                VISA Card
                            </Link>
                            <Link to="/recharge" className="dropdown-item" onClick={closeMobileMenu}>
                                Recharge Account
                            </Link>
                            <Link to="/transactions" className="dropdown-item" onClick={closeMobileMenu}>
                                Transaction History
                            </Link>
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test3')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="/booking/search" className="nav-link" onClick={closeMobileMenu}>
                            Booking Service
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test3' ? 'show' : ''}`}>
                            <Link to="/booking/search" className="dropdown-item" onClick={closeMobileMenu}>
                                Seat Booking
                            </Link>
                            
                        </div>
                    </li>

                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test4')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>
                            Profile
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
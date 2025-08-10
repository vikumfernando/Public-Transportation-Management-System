import '../styles/header.css';
import { useState } from 'react';

import { Link } from 'react-router-dom';

function Header() {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const dropdownEnter = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    const dropdownLeave = () => {
        setActiveDropdown(null);
    };

    const closeMobileMenu = () => {
        setActiveDropdown(null);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    <div className="logo-icon">TH</div>Brand Name
                </Link>

                <ul className= "nav-menu" id="navMenu">
                    <li 
                        className="nav-item dropdown"
                        onMouseEnter={() => dropdownEnter('test1')}
                        onMouseLeave={dropdownLeave}
                    >
                        <Link to="#" className="nav-link" onClick={closeMobileMenu}>Test 1 </Link>
                        
                        <div className={`dropdown-menu ${activeDropdown === 'test1' ? 'show' : ''}`}>
                            <Link to="/route-planning" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 1
                            </Link>
                            <Link to="/fleet-management" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 2
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
                            Test 2
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test2' ? 'show' : ''}`}>
                            <Link to="/bus-transit" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 1
                            </Link>
                            <Link to="/rail-systems" className="dropdown-item" onClick={closeMobileMenu}>
                                sub2 
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
                            Test 3
                        </Link>
                        <div className={`dropdown-menu ${activeDropdown === 'test3' ? 'show' : ''}`}>
                            <Link to="/documentation" className="dropdown-item" onClick={closeMobileMenu}>
                                sub 1
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
                    <button className="signout-btn" onClick={() => {
                        console.log('Signing out...');
                    }}>
                        SIGN OUT
                    </button>
                    
                </div>
            </div>
        </nav>
    );
}

export default Header;
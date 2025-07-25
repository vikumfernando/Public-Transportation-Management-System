import '../styles/header.css';

import { Link } from 'react-router-dom';

function Header() {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                 <Link to = "" className="navbar-brand">LOGO</Link>
               
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
                        <Link to="" className="nav-link">SignOut</Link>
                    </div>
                </div>
            </div>
        </nav>
    );

}

export default Header;
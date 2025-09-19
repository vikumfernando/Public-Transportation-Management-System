import "../styles/OffCanvas.css";
import { Link } from "react-router-dom";

function OffCanvas() {
  return (
    <div>
      <button
        className="hamburger-btn"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasExample"
        aria-controls="offcanvasExample"
      >
        <div className="hamburger-lines">
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
      </button>

      <div
        className="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title" id="offcanvasExampleLabel">
            Navigation
          </h2>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body d-flex flex-column">
          <div className="user-profile">
            <div className="user-avatar">FM</div>
            <div className="user-name">Fleet Manager</div>
            <div className="user-role">Administrator</div>
          </div>

          <div className="nav-section">
            <h4>Core Management</h4>

            <a href="/stoppage" className="nav-link-custom">
              Bus Stop
            </a>

            <a href="/routepage" className="nav-link-custom">
              Route
            </a>
            <a href="schedulepage" className="nav-link-custom">
              Schedule
            </a>

            <a href="#" className="nav-link-custom">
              Buses
            </a>
            <a href="#" className="nav-link-custom">
              User
            </a>
          </div>

          <div className="nav-section">
            <h4>Operations</h4>
            <a href="#" className="nav-link-custom">
              Payment Monitoring
            </a>
            <a href="#" className="nav-link-custom">
              Issue Reports
            </a>
          </div>

          <div className="nav-section">
            <h4>System</h4>
            <a href="#" className="nav-link-custom">
              Settings
            </a>
            <a href="#" className="nav-link-custom">
              Help Center
            </a>
            <a href="#" className="nav-link-custom">
              Documentation
            </a>
          </div>
          <div className="nav-footer mt-auto">
            <small>
              EcoTransit
              <br />
              Version 2.1.0
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OffCanvas;

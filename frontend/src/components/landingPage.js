import "../styles/landingPage.css";
import { Link } from "react-router-dom";
function landingPage() {
  console.log("Landing Page Rendered");
  return (
    <>
      <header>
        <div className="logo">
          <Link to="/" className="logo">
            <img
              style={{ width: "115px", height: "97px" }}
              src="/images/siteLogo.png"
            />
          </Link>
        </div>
        <nav>
          <Link to="/signin" className="">
            <button className="cta-button">Sign In</button>
          </Link>

          <Link to="/signup" className="">
            <button className="cta-button">Sign UP</button>
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p
            style={{ fontSize: "60px", fontWeight: "700" }}
            className="makeClass"
          >
            Making Public Transportation{" "}
            <span className="hero-highlight">Better. Together.</span>
          </p>
          <p>
            Experience a smarter, faster, and more reliable way to travel. Our
            IoT-powered public transportation system provides real-time bus
            tracking, accurate schedules, fare calculation, and route navigation
            — all in one platform. Stay informed, save time, and travel with
            confidence.
          </p>

          <Link to="/signin" className="">
            <button className="cta-button">Get Started</button>
          </Link>
        </div>
        <div className="hero-image">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23F0EBE8' width='600' height='400' rx='20'/%3E%3Ccircle cx='450' cy='200' r='100' fill='%230B5648' opacity='0.1'/%3E%3Ccircle cx='150' cy='150' r='80' fill='%238CDB66' opacity='0.15'/%3E%3Crect x='200' y='150' width='200' height='120' rx='10' fill='%23fff'/%3E%3Crect x='220' y='170' width='50' height='30' rx='5' fill='%234299e1'/%3E%3Crect x='280' y='170' width='50' height='30' rx='5' fill='%23ed64a6'/%3E%3Crect x='340' y='170' width='50' height='30' rx='5' fill='%238CDB66'/%3E%3Crect x='220' y='210' width='80' height='30' rx='5' fill='%23ecc94b'/%3E%3Crect x='310' y='210' width='80' height='30' rx='5' fill='%239f7aea'/%3E%3Ctext x='300' y='320' font-family='Arial' font-size='24' fill='%230B5648' text-anchor='middle' font-weight='bold'%3EReal-time Transit Management%3C/text%3E%3C/svg%3E"
            alt="Transit Management Dashboard"
          />
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon teal">
            <img
              style={{ width: "50px", height: "50px" }}
              src="./images/locationIconWhite.png"
            />
          </div>
          <div className="stat-number">700</div>
          <div className="stat-label">cities are powered by TransitFlow</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <img
              style={{ width: "50px", height: "50px" }}
              src="./images/busIcon.png"
            />
          </div>
          <div className="stat-number">7,000</div>
          <div className="stat-label">trips annually</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">
            <img
              style={{ width: "50px", height: "50px" }}
              src="./images/plantIcon.png"
            />
          </div>
          <div className="stat-number">11 million</div>
          <div className="stat-label">tons of CO2 reduced annually</div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>
            All your transportation management needs.
            <br />
            One centralized, easy-to-use platform.
          </h2>
        </div>
        <div className="feature-grid">
          <div className="feature-content">
            <h1>Platform</h1>
            <p>
              Our reliable seat booking feature ensures a smooth and hassle-free
              experience for every passenger. It’s fast, secure, and designed to
              prevent double bookings — offering real-time seat availability,
              instant confirmations, and flexible options for travelers.
            </p>
            <button className="cta-button">Learn More</button>
          </div>
          <div className="feature-image">
            <div className="schedule-mockup">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <span>06:00</span>
                <span>07:00</span>
                <span>08:00</span>
                <span>09:00</span>
                <span>10:00</span>
              </div>
              <div className="schedule-grid">
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item"></div>
                <div className="schedule-item"></div>

                <div className="schedule-item pink">3-B</div>
                <div className="schedule-item pink">3-A</div>
                <div className="schedule-item pink">3-A</div>
                <div className="schedule-item pink">3-A</div>
                <div className="schedule-item"></div>

                <div className="schedule-item pink">1-C</div>
                <div className="schedule-item pink">1-C</div>
                <div className="schedule-item pink">1-C</div>
                <div className="schedule-item pink">1-C</div>
                <div className="schedule-item pink">1-C</div>

                <div className="schedule-item yellow">2-A</div>
                <div className="schedule-item yellow">2-A</div>
                <div className="schedule-item yellow">2-B</div>
                <div className="schedule-item yellow">2-B</div>
                <div className="schedule-item"></div>

                <div className="schedule-item purple">1-C</div>
                <div className="schedule-item purple">1-C</div>
                <div className="schedule-item purple">1-C</div>
                <div className="schedule-item blue">1-C</div>
                <div className="schedule-item blue">1-C</div>

                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>
                <div className="schedule-item blue">4-A</div>

                <div className="schedule-item orange">2-A</div>
                <div className="schedule-item orange">2-A</div>
                <div className="schedule-item"></div>
                <div className="schedule-item orange">2-B</div>
                <div className="schedule-item orange">2-B</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to travel smarter?</h2>
        <p>
          Track your bus in real time, plan your route with precision, <br />
          and enjoy a seamless travel experience powered by IoT and innovation.
        </p>
        <a href="#" className="cta-button-white">
          Get Started Today
        </a>
      </section>
    </>
  );
}

export default landingPage;

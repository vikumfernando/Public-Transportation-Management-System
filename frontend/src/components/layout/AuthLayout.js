import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-white shadow-sm py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <Link to="/" className="text-decoration-none">
                <h3 className="mb-0 text-primary fw-bold">Transport Manager</h3>
              </Link>
            </Col>
            <Col className="text-end">
              <Link to="/login" className="btn btn-outline-primary me-2">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 py-5">
        <Container>
          {children}
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-light py-4 mt-auto">
        <Container>
          <Row>
            <Col md={6}>
              <p className="mb-0">&copy; {new Date().getFullYear()} Transport Manager. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-md-end">
              <Link to="/privacy" className="text-muted me-3">Privacy Policy</Link>
              <Link to="/terms" className="text-muted">Terms of Service</Link>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default AuthLayout;

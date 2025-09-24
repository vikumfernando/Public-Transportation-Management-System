import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <div className="display-1 text-muted mb-4">404</div>
      <h1 className="h2 mb-3">Page Not Found</h1>
      <p className="h4 text-muted fw-normal mb-4">The page you are looking for might have been removed or is temporarily unavailable.</p>
      <Button as={Link} to="/" variant="primary" size="lg" className="mt-3">
        Return to Home
      </Button>
    </Container>
  );
};

export default NotFound;

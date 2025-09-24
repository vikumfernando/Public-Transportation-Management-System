import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const location = useLocation();
  const { user } = useAuth();
  const from = location.state?.from?.pathname || '/';

  return (
    <Container className="text-center py-5">
      <div className="display-1 text-danger mb-4">403</div>
      <h1 className="h2 mb-3">Access Denied</h1>
      
      <Alert variant="warning" className="mx-auto" style={{ maxWidth: '600px' }}>
        <p className="mb-0">
          {user 
            ? `You don't have permission to access this page.`
            : 'Please sign in to access this page.'
          }
        </p>
      </Alert>
      
      <div className="mt-4">
        {user ? (
          <Button as={Link} to="/" variant="primary" className="me-2">
            Return to Home
          </Button>
        ) : (
          <>
            <Button as={Link} to="/login" variant="primary" className="me-2"
              state={{ from: location.state?.from }}>
              Sign In
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Go to Home
            </Button>
          </>
        )}
      </div>
    </Container>
  );
};

export default Unauthorized;

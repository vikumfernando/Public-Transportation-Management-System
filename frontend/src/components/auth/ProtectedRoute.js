import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

/**
 * ProtectedRoute component that renders children only if user is authenticated.
 * If not authenticated, redirects to login page.
 * If user doesn't have required roles, redirects to unauthorized page.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.roles=[]] - Array of allowed roles
 * @param {boolean} [props.redirectIfAuthenticated=false] - If true, redirects to home if user is already authenticated
 * @param {string} [props.redirectPath='/'] - Path to redirect to if redirectIfAuthenticated is true
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectIfAuthenticated = false,
  redirectPath = '/',
  ...rest 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle redirect if user is already authenticated and redirectIfAuthenticated is true
  useEffect(() => {
    if (!loading && isAuthenticated && redirectIfAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectIfAuthenticated, redirectPath]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Handle redirect for authenticated users (e.g., redirect from login/register if already logged in)
  if (redirectIfAuthenticated) {
    return children;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          ...(location.state || {}) 
        }} 
        replace 
      />
    );
  }

  // Check if route is role protected and user has required role
  if (roles.length > 0 && !roles.some(role => user.roles?.includes(role))) {
    // User is authenticated but doesn't have the required role
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: 'You do not have permission to access this page.'
        }} 
        replace 
      />
    );
  }

  // If we get here, user is authenticated and has required roles
  return children;
};

export default ProtectedRoute;

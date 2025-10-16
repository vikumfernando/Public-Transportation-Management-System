import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionValidator = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateSession = () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // If no session data, redirect to login
      if (!user || !token) {
        // Clear any remaining data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('remember_email');
        
        // Clear browser history to prevent back navigation
        window.history.replaceState(null, '', '/signin');
        
        // Navigate to login
        navigate('/signin', { replace: true });
        return false;
      }
      
      return true;
    };

    // Validate session on mount and when location changes
    validateSession();
  }, [navigate, location.pathname]);

  // Check session before rendering children
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return null; // Don't render anything while redirecting
  }

  return children;
};

export default SessionValidator;

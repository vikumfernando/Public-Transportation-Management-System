import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RoleBasedRedirect() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const userRole = user.role;
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                // For passengers and drivers, go to location page
                navigate('/location');
            }
        } else {
            // If no user, go to landing page
            navigate('/');
        }
    }, [user, navigate]);

    return null; // This component doesn't render anything
}

export default RoleBasedRedirect;

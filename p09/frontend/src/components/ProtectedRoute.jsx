import { Navigate, useLocation } from 'react-router-dom';
import Spinner from './Spinner.jsx';
import { useAuth } from '../auth/useAuth.js';

function ProtectedRoute({ children }) {
  const { user, isCheckingSession } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return <Spinner label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;

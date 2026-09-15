import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === 'worker') {
    if (profile.worker_department === 'medical') return <Navigate to="/medical" replace />;
    if (profile.worker_department === 'fire') return <Navigate to="/fire" replace />;
    return <Navigate to="/security" replace />;
  }

  if (profile.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }

  if (profile.role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  }

  return <Navigate to="/student" replace />;
}

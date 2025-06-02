import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';

export default function RootRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return null; // or a spinner
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role === 'recruiter') {
    return <Navigate to="/dashboard" replace />;
  }
  if (role === 'candidate') {
    return <Navigate to="/candidate" replace />;
  }

  return <Navigate to="/auth" replace />;
} 
import React, { useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'candidate' | 'recruiter';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [retry, setRetry] = useState(0);
  const { role, loading: roleLoading } = useUserRole(retry);
  const location = useLocation();

  console.log('ProtectedRoute: Auth loading:', authLoading, 'User:', user?.id);
  console.log('ProtectedRoute: Role loading:', roleLoading, 'Role:', role);
  console.log('ProtectedRoute: Required role:', requiredRole);

  if (authLoading || roleLoading) {
    console.log('ProtectedRoute: Still loading auth or role');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    const handleRetry = () => setRetry(r => r + 1);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="text-red-600 text-lg font-semibold text-center">
          Your account is missing a role.<br />
          Please contact support or try signing up again.
        </div>
        <div className="flex space-x-2">
          <Button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</Button>
          <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white">Retry</Button>
        </div>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole) {
    if (role === 'candidate') {
      return <Navigate to="/candidate" replace />;
    }
    if (role === 'recruiter') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;

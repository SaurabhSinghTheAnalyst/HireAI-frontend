import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

export const useUserRole = (retry = 0) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('useUserRole: Starting role fetch, user:', user?.id);
      
      if (!user) {
        console.log('useUserRole: No user found, setting role to null');
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('useUserRole: Fetching role for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        console.log('useUserRole: Supabase query result:', { data, error });
        if (error) {
          console.error('useUserRole: Error fetching user role:', error);
          setRole(null);
        } else if (data) {
          console.log('useUserRole: User role fetched successfully:', data.role);
          setRole(data.role);
        } else {
          console.log('useUserRole: No role found for user');
          setRole(null);
        }
      } catch (error) {
        console.error('useUserRole: Unexpected error fetching user role:', error);
        setRole(null);
      } finally {
        console.log('useUserRole: Finished loading, role:', role);
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, retry]);

  return { role, loading };
};

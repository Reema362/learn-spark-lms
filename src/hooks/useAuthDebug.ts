
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    hasSession: false,
    hasUser: false,
    userId: null,
    userEmail: null,
    sessionValid: false,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 useAuthDebug - Checking authentication...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        const info = {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id || null,
          userEmail: session?.user?.email || null,
          sessionValid: !!session && !!session.user,
          error: error?.message || null
        };
        
        console.log('🔍 useAuthDebug - Auth info:', info);
        setDebugInfo(info);
      } catch (err: any) {
        console.error('🔍 useAuthDebug - Error:', err);
        setDebugInfo(prev => ({ ...prev, error: err.message }));
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 useAuthDebug - Auth state changed:', event, !!session);
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  return debugInfo;
};

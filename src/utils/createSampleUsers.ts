
import { supabase } from '@/integrations/supabase/client';

export const createSampleLearner = async () => {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'learner@slksoftware.com',
      password: 'LearnerPass123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Sample',
        last_name: 'Learner'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return false;
    }

    if (authData.user) {
      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: 'learner@slksoftware.com',
          first_name: 'Sample',
          last_name: 'Learner',
          role: 'learner',
          department: 'IT Security'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return false;
      }

      console.log('Sample learner created successfully');
      return true;
    }
  } catch (error) {
    console.error('Error in createSampleLearner:', error);
    return false;
  }
  
  return false;
};

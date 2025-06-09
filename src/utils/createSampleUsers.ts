
import { supabase } from '@/integrations/supabase/client';

export const createSampleLearner = async () => {
  try {
    // Create sample learner profile directly (simulating SSO user creation)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'learner@slksoftware.com')
      .single();

    if (existingProfile) {
      console.log('Sample learner already exists');
      return true;
    }

    // Create the profile for SSO simulation
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        email: 'learner@slksoftware.com',
        first_name: 'Sample',
        last_name: 'Learner',
        role: 'user', // Use 'user' instead of 'learner' to match database schema
        department: 'IT Security'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return false;
    }

    console.log('Sample learner created successfully');
    return true;
  } catch (error) {
    console.error('Error in createSampleLearner:', error);
    return false;
  }
};

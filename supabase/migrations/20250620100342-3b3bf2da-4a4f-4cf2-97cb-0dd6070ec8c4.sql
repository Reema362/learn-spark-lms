
-- Create Supabase Auth accounts for Naveen and Reema with proper passwords
-- This will allow them to authenticate through Supabase instead of demo mode

-- First, let's get the existing profile IDs for Naveen and Reema
DO $$
DECLARE
    naveen_profile_id uuid;
    reema_profile_id uuid;
BEGIN
    -- Get existing profile IDs
    SELECT id INTO naveen_profile_id FROM public.profiles WHERE email = 'naveen.v1@slksoftware.com';
    SELECT id INTO reema_profile_id FROM public.profiles WHERE email = 'reema.jain@slksoftware.com';
    
    -- If profiles don't exist, create them first
    IF naveen_profile_id IS NULL THEN
        naveen_profile_id := gen_random_uuid();
        INSERT INTO public.profiles (id, email, first_name, last_name, role, department)
        VALUES (naveen_profile_id, 'naveen.v1@slksoftware.com', 'Naveen', 'V', 'admin', 'IT');
        RAISE NOTICE 'Created profile for Naveen with ID: %', naveen_profile_id;
    ELSE
        RAISE NOTICE 'Found existing profile for Naveen with ID: %', naveen_profile_id;
    END IF;
    
    IF reema_profile_id IS NULL THEN
        reema_profile_id := gen_random_uuid();
        INSERT INTO public.profiles (id, email, first_name, last_name, role, department)
        VALUES (reema_profile_id, 'reema.jain@slksoftware.com', 'Reema', 'Jain', 'admin', 'IT');
        RAISE NOTICE 'Created profile for Reema with ID: %', reema_profile_id;
    ELSE
        RAISE NOTICE 'Found existing profile for Reema with ID: %', reema_profile_id;
    END IF;
    
    -- Now create auth users with the same IDs as their profiles
    -- Note: In production, you would typically use Supabase's admin API or dashboard
    -- This is a simplified approach for development
    
    -- Check if auth users already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'naveen.v1@slksoftware.com') THEN
        -- Insert auth user for Naveen
        INSERT INTO auth.users (
            id, 
            instance_id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            naveen_profile_id,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'naveen.v1@slksoftware.com',
            crypt('AdminPass2024!Strong', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Naveen", "last_name": "V"}',
            false,
            'authenticated'
        );
        RAISE NOTICE 'Created auth user for Naveen';
    ELSE
        RAISE NOTICE 'Auth user for Naveen already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'reema.jain@slksoftware.com') THEN
        -- Insert auth user for Reema
        INSERT INTO auth.users (
            id, 
            instance_id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            reema_profile_id,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'reema.jain@slksoftware.com',
            crypt('AdminPass2024!Strong', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Reema", "last_name": "Jain"}',
            false,
            'authenticated'
        );
        RAISE NOTICE 'Created auth user for Reema';
    ELSE
        RAISE NOTICE 'Auth user for Reema already exists';
    END IF;
    
    -- Ensure profiles have admin role
    UPDATE public.profiles 
    SET role = 'admin', updated_at = now()
    WHERE email IN ('naveen.v1@slksoftware.com', 'reema.jain@slksoftware.com');
    
    RAISE NOTICE 'Migration completed successfully';
END $$;

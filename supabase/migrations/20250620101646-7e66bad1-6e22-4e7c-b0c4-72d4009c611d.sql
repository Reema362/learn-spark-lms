
-- Update passwords for existing Naveen and Reema auth accounts
-- This forces the password update for accounts that already existed

DO $$
DECLARE
    naveen_user_id uuid;
    reema_user_id uuid;
BEGIN
    -- Get the user IDs for Naveen and Reema from auth.users
    SELECT id INTO naveen_user_id FROM auth.users WHERE email = 'naveen.v1@slksoftware.com';
    SELECT id INTO reema_user_id FROM auth.users WHERE email = 'reema.jain@slksoftware.com';
    
    -- Update Naveen's password if user exists
    IF naveen_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('AdminPass2024!Strong', gen_salt('bf')),
            updated_at = now()
        WHERE id = naveen_user_id;
        RAISE NOTICE 'Updated password for Naveen (ID: %)', naveen_user_id;
    ELSE
        RAISE NOTICE 'Naveen user not found in auth.users';
    END IF;
    
    -- Update Reema's password if user exists
    IF reema_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('AdminPass2024!Strong', gen_salt('bf')),
            updated_at = now()
        WHERE id = reema_user_id;
        RAISE NOTICE 'Updated password for Reema (ID: %)', reema_user_id;
    ELSE
        RAISE NOTICE 'Reema user not found in auth.users';
    END IF;
    
    -- Clear any existing sessions for these users to force fresh login
    DELETE FROM auth.sessions 
    WHERE user_id IN (naveen_user_id, reema_user_id) 
    AND naveen_user_id IS NOT NULL 
    AND reema_user_id IS NOT NULL;
    
    RAISE NOTICE 'Password update migration completed successfully';
END $$;

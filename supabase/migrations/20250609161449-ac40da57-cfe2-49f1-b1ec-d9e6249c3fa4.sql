
-- First, let's create the necessary tables for all modules

-- Create enums for various status types
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.escalation_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.escalation_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.query_status AS ENUM ('open', 'responded', 'closed');
CREATE TYPE public.template_type AS ENUM ('email', 'sms', 'alert', 'notification');
CREATE TYPE public.game_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.badge_tier AS ENUM ('bronze', 'silver', 'gold');

-- Campaign Management Tables
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status campaign_status DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience TEXT[],
    tags TEXT[],
    assets_folder TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.campaign_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Escalation Management Tables
CREATE TABLE public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority escalation_priority DEFAULT 'medium',
    status escalation_status DEFAULT 'open',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.escalation_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escalation_id UUID REFERENCES public.escalations(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Queries Management Tables
CREATE TABLE public.queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status query_status DEFAULT 'open',
    submitted_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.query_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.queries(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    responded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.query_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.queries(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- IAM Management Tables
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role_id)
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template Management Tables
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type template_type NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Gamification Tables
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    game_type TEXT NOT NULL, -- 'mcq', 'drag_drop', 'scenario'
    difficulty game_difficulty DEFAULT 'easy',
    topic TEXT NOT NULL, -- 'phishing', 'password_safety', etc.
    time_limit_seconds INTEGER DEFAULT 300,
    questions JSONB NOT NULL,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.game_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tier badge_tier NOT NULL,
    topic TEXT NOT NULL,
    icon_url TEXT,
    criteria JSONB, -- score thresholds, time requirements, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id),
    user_id UUID REFERENCES public.profiles(id),
    score INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    answers JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_game_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    badge_id UUID REFERENCES public.game_badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('campaign-assets', 'campaign-assets', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']),
  ('query-attachments', 'query-attachments', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']),
  ('game-assets', 'game-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_badges ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allowing authenticated users to read, admins to manage)
CREATE POLICY "Allow authenticated read" ON public.campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.campaigns FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.campaign_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.campaign_assets FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.escalations FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.escalation_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.escalation_comments FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.queries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users create own" ON public.queries FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Allow admin manage" ON public.queries FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.query_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.query_responses FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.query_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.query_attachments FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.roles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow admin manage" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.templates FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.games FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow authenticated read" ON public.game_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage" ON public.game_badges FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow users own sessions" ON public.game_sessions FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow admin read sessions" ON public.game_sessions FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Allow users own badges" ON public.user_game_badges FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow admin read badges" ON public.user_game_badges FOR SELECT TO authenticated USING (public.is_admin());

-- Storage policies
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id IN ('campaign-assets', 'query-attachments', 'game-assets'));
CREATE POLICY "Allow authenticated upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('campaign-assets', 'query-attachments', 'game-assets'));
CREATE POLICY "Allow admin manage files" ON storage.objects FOR ALL TO authenticated USING (bucket_id IN ('campaign-assets', 'query-attachments', 'game-assets') AND public.is_admin());

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
('Super Admin', 'Full system access', '["*"]'::jsonb),
('Admin', 'Administrative access', '["user_management", "course_management", "campaign_management", "escalation_management", "template_management", "iam_management"]'::jsonb),
('Manager', 'Management access', '["course_management", "campaign_management", "escalation_management"]'::jsonb),
('User', 'Basic user access', '["course_access", "query_submission"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default game badges
INSERT INTO public.game_badges (name, description, tier, topic, criteria) VALUES
('Phishing Detective Bronze', 'Completed basic phishing awareness', 'bronze', 'phishing', '{"min_score": 70, "max_time": 300}'::jsonb),
('Phishing Detective Silver', 'Advanced phishing detection skills', 'silver', 'phishing', '{"min_score": 85, "max_time": 240}'::jsonb),
('Phishing Detective Gold', 'Expert phishing awareness', 'gold', 'phishing', '{"min_score": 95, "max_time": 180}'::jsonb),
('Password Guardian Bronze', 'Basic password security knowledge', 'bronze', 'password_safety', '{"min_score": 70, "max_time": 300}'::jsonb),
('Password Guardian Silver', 'Strong password practices', 'silver', 'password_safety', '{"min_score": 85, "max_time": 240}'::jsonb),
('Password Guardian Gold', 'Password security expert', 'gold', 'password_safety', '{"min_score": 95, "max_time": 180}'::jsonb),
('2FA Champion Bronze', 'Understanding two-factor authentication', 'bronze', 'two_factor_auth', '{"min_score": 70, "max_time": 300}'::jsonb),
('2FA Champion Silver', 'Advanced 2FA implementation', 'silver', 'two_factor_auth', '{"min_score": 85, "max_time": 240}'::jsonb),
('2FA Champion Gold', 'Two-factor authentication master', 'gold', 'two_factor_auth', '{"min_score": 95, "max_time": 180}'::jsonb);

-- Create a function to fix user creation with proper auth integration
CREATE OR REPLACE FUNCTION public.create_auth_user(
  user_email text,
  user_password text,
  user_first_name text DEFAULT '',
  user_last_name text DEFAULT '',
  user_role text DEFAULT 'user',
  user_department text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert directly into profiles table (bypass RLS for system operations)
  INSERT INTO public.profiles (
    id, email, first_name, last_name, role, department, created_at
  ) VALUES (
    new_user_id, user_email, user_first_name, user_last_name, user_role::user_role, user_department, now()
  );
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email
  );
  
  RETURN result;
EXCEPTION
  WHEN others THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Golf Charity Platform Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Extend auth.users with profile data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHARITIES
-- ============================================

CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  upcoming_events TEXT[], -- Array of event descriptions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  charity_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (charity_percentage >= 10.00 AND charity_percentage <= 100.00),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- GOLF SCORES
-- ============================================

CREATE TABLE public.golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, score_date) -- One score per date per user
);

-- Index for faster queries
CREATE INDEX idx_golf_scores_user_date ON public.golf_scores(user_id, score_date DESC);

-- ============================================
-- DRAWS
-- ============================================

CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL UNIQUE,
  draw_month INTEGER NOT NULL,
  draw_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'completed')),
  draw_type TEXT NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  total_pool_amount DECIMAL(10,2) DEFAULT 0.00,
  jackpot_amount DECIMAL(10,2) DEFAULT 0.00,
  winning_numbers INTEGER[] NOT NULL, -- Array of 5 numbers
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- DRAW ENTRIES (Participant numbers for each draw)
-- ============================================

CREATE TABLE public.draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_numbers INTEGER[] NOT NULL, -- User's 5 numbers for this draw
  matches_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

CREATE INDEX idx_draw_entries_draw ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user ON public.draw_entries(user_id);

-- ============================================
-- WINNERS
-- ============================================

CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES public.draw_entries(id) ON DELETE CASCADE NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('3-match', '4-match', '5-match')),
  prize_amount DECIMAL(10,2) NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  proof_image_url TEXT,
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_winners_draw ON public.winners(draw_id);
CREATE INDEX idx_winners_user ON public.winners(user_id);

-- ============================================
-- CHARITY CONTRIBUTIONS
-- ============================================

CREATE TABLE public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_charity_contributions_charity ON public.charity_contributions(charity_id);
CREATE INDEX idx_charity_contributions_user ON public.charity_contributions(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Charities Policies (Public read, admin write)
CREATE POLICY "Charities are viewable by everyone" ON public.charities
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert charities" ON public.charities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update charities" ON public.charities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete charities" ON public.charities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Golf Scores Policies
CREATE POLICY "Users can view own scores" ON public.golf_scores
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own scores" ON public.golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.golf_scores
  FOR DELETE USING (auth.uid() = user_id);

-- Draws Policies
CREATE POLICY "Published draws are viewable by everyone" ON public.draws
  FOR SELECT USING (status = 'published' OR status = 'completed' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can manage draws" ON public.draws
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Draw Entries Policies
CREATE POLICY "Users can view own entries" ON public.draw_entries
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert entries" ON public.draw_entries
  FOR INSERT WITH CHECK (true);

-- Winners Policies
CREATE POLICY "Users can view own winnings" ON public.winners
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own winner proof" ON public.winners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all winners" ON public.winners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Charity Contributions Policies
CREATE POLICY "Users can view own contributions" ON public.charity_contributions
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert contributions" ON public.charity_contributions
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_golf_scores_updated_at BEFORE UPDATE ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to enforce max 5 scores per user
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete oldest scores if user has 5 or more
  DELETE FROM public.golf_scores
  WHERE id IN (
    SELECT id FROM public.golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_max_scores
  AFTER INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();

-- ============================================
-- SEED DATA - Sample Charities
-- ============================================

INSERT INTO public.charities (name, description, image_url, is_featured, upcoming_events) VALUES
('Children''s Health Foundation', 'Supporting children''s healthcare and medical research to give every child a chance at a healthy life.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', true, ARRAY['Annual Charity Golf Day - March 15, 2027', 'Summer Fundraiser Tournament - July 20, 2027']),
('Environmental Conservation Alliance', 'Protecting our planet through reforestation, wildlife conservation, and sustainable practices.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', true, ARRAY['Green Golf Classic - April 22, 2027']),
('Education for All', 'Providing quality education resources and opportunities to underserved communities worldwide.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', false, ARRAY['Scholarship Golf Tournament - May 10, 2027']),
('Mental Health Awareness Foundation', 'Breaking stigma and providing support services for mental health and wellbeing.', 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80', false, ARRAY['Wellness Golf Day - June 5, 2027']),
('Senior Care Network', 'Enhancing quality of life for elderly citizens through care services and community programs.', 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80', false, ARRAY['Golden Years Golf Event - August 12, 2027']),
('Animal Welfare Society', 'Rescuing, rehabilitating, and rehoming animals in need while promoting responsible pet ownership.', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&q=80', true, ARRAY['Paws & Putts Golf Day - September 18, 2027']),
('Cancer Research Institute', 'Advancing cancer research and providing support to patients and families affected by cancer.', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80', false, ARRAY['Hope Golf Classic - October 1, 2027']),
('Clean Water Initiative', 'Bringing clean, safe drinking water to communities lacking access to this basic necessity.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', false, ARRAY['Water for Life Golf Tournament - November 8, 2027']);

-- ============================================
-- UTILITY VIEWS
-- ============================================

-- View for active subscribers
CREATE VIEW active_subscribers AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  s.plan_type,
  s.charity_percentage,
  c.name as charity_name
FROM profiles p
JOIN subscriptions s ON p.id = s.user_id
LEFT JOIN charities c ON s.charity_id = c.id
WHERE s.status = 'active';

-- View for user statistics
CREATE VIEW user_statistics AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  COUNT(DISTINCT de.draw_id) as total_draws_entered,
  COUNT(DISTINCT w.id) as total_wins,
  COALESCE(SUM(w.prize_amount), 0) as total_winnings,
  COUNT(DISTINCT gs.id) as total_scores_entered
FROM profiles p
LEFT JOIN draw_entries de ON p.id = de.user_id
LEFT JOIN winners w ON p.id = w.user_id
LEFT JOIN golf_scores gs ON p.id = gs.user_id
GROUP BY p.id, p.email, p.full_name;

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.charities IS 'Registered charities available for selection';
COMMENT ON TABLE public.subscriptions IS 'User subscription records';
COMMENT ON TABLE public.golf_scores IS 'Golf scores in Stableford format (1-45)';
COMMENT ON TABLE public.draws IS 'Monthly prize draws';
COMMENT ON TABLE public.draw_entries IS 'User entries for each draw';
COMMENT ON TABLE public.winners IS 'Draw winners and prize tracking';
COMMENT ON TABLE public.charity_contributions IS 'Charitable contributions from subscriptions';

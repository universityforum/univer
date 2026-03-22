-- Add mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  is_top_mentor BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add mentor ratings table
CREATE TABLE IF NOT EXISTS mentor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, user_id)
);

-- Add mentor messages table
CREATE TABLE IF NOT EXISTS mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add capacity to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 100;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Social';
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer TEXT;

-- Add image_url and category_type to clubs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'Culture';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS is_recruiting BOOLEAN DEFAULT true;

-- Add is_solved to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_solved BOOLEAN DEFAULT false;

-- Enable RLS for new tables
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Mentors policies
CREATE POLICY "Anyone can view mentors" ON mentors FOR SELECT USING (true);
CREATE POLICY "Users can create their own mentor profile" ON mentors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mentor profile" ON mentors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mentor profile" ON mentors FOR DELETE USING (auth.uid() = user_id);

-- Mentor ratings policies
CREATE POLICY "Anyone can view ratings" ON mentor_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate" ON mentor_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON mentor_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Mentor messages policies
CREATE POLICY "Users can view their messages" ON mentor_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id));
CREATE POLICY "Authenticated users can send messages" ON mentor_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Event registrations policies
CREATE POLICY "Anyone can view registrations" ON event_registrations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister themselves" ON event_registrations FOR DELETE USING (auth.uid() = user_id);

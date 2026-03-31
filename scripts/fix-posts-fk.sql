-- Fix foreign key constraint for posts table
-- Ensure the posts table properly references auth.users through profiles table

-- 1. Check current foreign key constraint on posts table
-- This will help verify the constraint exists and is correct

-- 2. Ensure posts.user_id references profiles.id (which itself references auth.users)
-- If posts are being created, ensure the user_id is from an authenticated session

-- 3. Add RLS (Row Level Security) policies if not already in place
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for INSERT - users can only insert their own posts
CREATE POLICY "Users can insert their own posts" ON posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for SELECT - everyone can view posts
CREATE POLICY "Anyone can view posts" ON posts
FOR SELECT USING (true);

-- Create RLS policy for UPDATE - users can only update their own posts
CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy for DELETE - users can only delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
FOR DELETE USING (auth.uid() = user_id);

-- 4. Ensure replies table also has proper RLS
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own replies" ON replies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view replies" ON replies
FOR SELECT USING (true);

CREATE POLICY "Users can update their own replies" ON replies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" ON replies
FOR DELETE USING (auth.uid() = user_id);

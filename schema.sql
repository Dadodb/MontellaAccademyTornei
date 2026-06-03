-- Supabase / PostgreSQL Schema Definition for MontellaTornei
-- This script creates the required database tables, relationships, and enables real-time subscriptions.

-- 1. Create custom enum type for match status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished');
    END IF;
END $$;

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create fields table
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    manual_rank_priority INTEGER NOT NULL DEFAULT 0, -- Used for manual tie-breaker resolution by operator
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_team_name_per_category UNIQUE (name, category_id)
);

-- 5. Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    team_home_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_away_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    score_home INTEGER NOT NULL DEFAULT 0 CHECK (score_home >= 0),
    score_away INTEGER NOT NULL DEFAULT 0 CHECK (score_away >= 0),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status match_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_teams_are_different CHECK (team_home_id <> team_away_id)
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for public read-only access (and update access for operator actions)
-- Select Policies (Public Access)
CREATE POLICY "Allow public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for fields" ON fields FOR SELECT USING (true);
CREATE POLICY "Allow public read access for teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access for matches" ON matches FOR SELECT USING (true);

-- Update Policies (Publicly allowed for demo/operator operations without Auth for this MVP)
CREATE POLICY "Allow public updates for teams" ON teams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public updates for matches" ON matches FOR UPDATE USING (true) WITH CHECK (true);

-- Delete and Insert (Optional, uncomment if needed for setup, otherwise handled via Supabase dashboard)
CREATE POLICY "Allow public inserts for matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for fields" ON fields FOR INSERT WITH CHECK (true);

-- 8. Add Tables to Supabase Realtime Publication
-- Note: Supabase project default publication is 'supabase_realtime'.
-- We check and add the tables to this publication.
BEGIN;
  -- If table already in publication, this won't fail if we do it cleanly.
  -- Supabase allows adding tables to the publication.
  ALTER PUBLICATION supabase_realtime ADD TABLE matches;
  ALTER PUBLICATION supabase_realtime ADD TABLE fields;
COMMIT;

-- 9. Insert Sample Seed Data (Useful for immediate testing)
-- Feel free to run this to get initial data.
/*
-- Categories
INSERT INTO categories (id, name) VALUES 
('c1111111-1111-1111-1111-111111111111', 'Primi Calci 2018'),
('c2222222-2222-2222-2222-222222222222', 'Pulcini 2015')
ON CONFLICT DO NOTHING;

-- Fields
INSERT INTO fields (id, name) VALUES 
('f1111111-1111-1111-1111-111111111111', 'Campo A (Tribuna Destra)'),
('f2222222-2222-2222-2222-222222222222', 'Campo B (Lato Calcetto)'),
('f3333333-3333-3333-3333-333333333333', 'Campo Calcetto')
ON CONFLICT DO NOTHING;

-- Teams
INSERT INTO teams (id, name, category_id) VALUES 
('t1111111-1111-1111-1111-111111111111', 'Montella Calcio A', 'c1111111-1111-1111-1111-111111111111'),
('t2222222-2222-2222-2222-222222222222', 'Virtus Avellino', 'c1111111-1111-1111-1111-111111111111'),
('t3333333-3333-3333-3333-333333333333', 'Lioni FC', 'c1111111-1111-1111-1111-111111111111'),
('t4444444-4444-4444-4444-444444444444', 'Bagnoli Calcio', 'c1111111-1111-1111-1111-111111111111'),
('t5555555-5555-5555-5555-555555555555', 'Montella Calcio B', 'c2222222-2222-2222-2222-222222222222'),
('t6666666-6666-6666-6666-666666666666', 'Nusco Academy', 'c2222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Matches
INSERT INTO matches (category_id, field_id, team_home_id, team_away_id, score_home, score_away, scheduled_time, status) VALUES 
('c1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 't2222222-2222-2222-2222-222222222222', 2, 1, now() - interval '30 minutes', 'finished'),
('c1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', 't3333333-3333-3333-3333-333333333333', 't4444444-4444-4444-4444-444444444444', 0, 0, now() - interval '10 minutes', 'live'),
('c2222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333', 't5555555-5555-5555-5555-555555555555', 't6666666-6666-6666-6666-666666666666', 0, 0, now() + interval '30 minutes', 'scheduled');
*/

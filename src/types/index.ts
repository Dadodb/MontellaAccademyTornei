// Types definitions for the MontellaTornei application

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Category {
  id: string;
  name: string;
  groups_count: number;
  created_at?: string;
}

export interface Field {
  id: string;
  name: string;
  created_at?: string;
}

export interface Team {
  id: string;
  name: string;
  category_id: string;
  group_name: string | null;
  manual_rank_priority: number;
  created_at?: string;
}

export interface Match {
  id: string;
  category_id: string;
  field_id: string;
  team_home_id: string | null;
  team_away_id: string | null;
  placeholder_home: string | null;
  placeholder_away: string | null;
  stage: string; // 'group', 'semi', 'final', etc.
  score_home: number;
  score_away: number;
  scheduled_time: string;
  started_at: string | null;  // Timestamp when the match went live
  status: MatchStatus;
  created_at?: string;
}

// Extended interface containing joined relation details from Supabase queries
export interface MatchWithDetails extends Match {
  category: Category;
  field: Field;
  team_home: Team | null;
  team_away: Team | null;
}

// Leaderboard row entry interface
export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  manualRankPriority: number; // Used to break perfect ties manually
}

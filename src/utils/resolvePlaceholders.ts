import type { MatchWithDetails, Team, Match } from '../types';
import { calculateStandings } from './standings';

export interface PlaceholderResolution {
  matchId: string;
  side: 'home' | 'away';
  teamId: string;
}

/**
 * Parses a group-stage placeholder like "1° Girone A" and returns
 * { position: 0, groupName: "A" } (position is 0-indexed).
 * Returns null if the placeholder doesn't match.
 */
function parseGroupPlaceholder(placeholder: string): { position: number; groupName: string } | null {
  // Match patterns like "1° Girone A", "2° Girone B"
  const match = placeholder.match(/^(\d+)°\s*Girone\s+(.+)$/i);
  if (!match) return null;
  return {
    position: parseInt(match[1], 10) - 1, // convert to 0-indexed
    groupName: match[2].trim(),
  };
}

/**
 * Parses a semifinal placeholder like "Vincente Semifinale 1" and returns
 * the 1-indexed semifinal number, or null.
 */
function parseSemifinalPlaceholder(placeholder: string): number | null {
  const match = placeholder.match(/^Vincente\s+Semifinale\s+(\d+)$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Resolves placeholders for knockout-stage matches by examining
 * finished group-stage standings and semifinal results.
 *
 * Returns a list of resolutions: which match should get which team assigned.
 */
export function resolvePlaceholders(
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): PlaceholderResolution[] {
  const resolutions: PlaceholderResolution[] = [];

  // Find matches that still have unresolved placeholders
  const unresolvedMatches = allMatches.filter(
    (m) => m.stage !== 'group' && (m.team_home_id === null || m.team_away_id === null)
  );

  for (const match of unresolvedMatches) {
    // Try to resolve home placeholder
    if (match.team_home_id === null && match.placeholder_home) {
      const teamId = resolveOnePlaceholder(match.placeholder_home, match.category_id, allMatches, allTeams);
      if (teamId) {
        resolutions.push({ matchId: match.id, side: 'home', teamId });
      }
    }

    // Try to resolve away placeholder
    if (match.team_away_id === null && match.placeholder_away) {
      const teamId = resolveOnePlaceholder(match.placeholder_away, match.category_id, allMatches, allTeams);
      if (teamId) {
        resolutions.push({ matchId: match.id, side: 'away', teamId });
      }
    }
  }

  return resolutions;
}

/**
 * Resolves a single placeholder string to a team ID (or null if not yet resolvable).
 */
function resolveOnePlaceholder(
  placeholder: string,
  categoryId: string,
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): string | null {
  // --- 1. Group placeholder: "Xᵒ Girone Y" ---
  const groupPh = parseGroupPlaceholder(placeholder);
  if (groupPh) {
    return resolveGroupPlaceholder(groupPh.position, groupPh.groupName, categoryId, allMatches, allTeams);
  }

  // --- 2. Semifinal placeholder: "Vincente Semifinale N" ---
  const semiNum = parseSemifinalPlaceholder(placeholder);
  if (semiNum !== null) {
    return resolveSemifinalPlaceholder(semiNum, categoryId, allMatches);
  }

  return null;
}

/**
 * Resolves a "Xth of Group Y" placeholder.
 * Only resolves if ALL group-stage matches in that group+category are finished.
 */
function resolveGroupPlaceholder(
  position: number,
  groupName: string,
  categoryId: string,
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): string | null {
  // Get teams in this group
  const groupTeams = allTeams.filter(
    (t) => t.category_id === categoryId && (t.group_name || 'A') === groupName
  );

  if (groupTeams.length === 0) return null;

  // Get all group-stage matches for this category & group
  const groupTeamIds = new Set(groupTeams.map((t) => t.id));
  const groupMatches = allMatches.filter(
    (m) =>
      m.category_id === categoryId &&
      m.stage === 'group' &&
      m.team_home_id !== null &&
      m.team_away_id !== null &&
      groupTeamIds.has(m.team_home_id!) &&
      groupTeamIds.has(m.team_away_id!)
  );

  // Check if ALL group matches are finished
  const allFinished = groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
  if (!allFinished) return null;

  // Calculate standings
  const standings = calculateStandings(groupMatches as Match[], groupTeams);

  if (position >= 0 && position < standings.length) {
    return standings[position].teamId;
  }

  return null;
}

/**
 * Resolves a "Vincente Semifinale N" placeholder.
 * Only resolves if the Nth semifinal of this category is finished and has a clear winner.
 */
function resolveSemifinalPlaceholder(
  semiNumber: number,
  categoryId: string,
  allMatches: MatchWithDetails[],
): string | null {
  // Find all semifinals in this category, sorted by scheduled time
  const semis = allMatches
    .filter((m) => m.category_id === categoryId && m.stage === 'semi')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  const targetSemi = semis[semiNumber - 1]; // 1-indexed
  if (!targetSemi) return null;
  if (targetSemi.status !== 'finished') return null;
  if (targetSemi.team_home_id === null || targetSemi.team_away_id === null) return null;

  // Determine winner
  if (targetSemi.score_home > targetSemi.score_away) {
    return targetSemi.team_home_id;
  } else if (targetSemi.score_away > targetSemi.score_home) {
    return targetSemi.team_away_id;
  }

  // Draw in semifinal — no clear winner yet (needs tie-breaker logic from operator)
  return null;
}

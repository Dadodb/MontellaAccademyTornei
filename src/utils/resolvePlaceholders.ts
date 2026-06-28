import type { MatchWithDetails, Team, Match } from '../types';
import { calculateStandings, findPerfectTies } from './standings';

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
  // Matches "1° Girone A", "1o Girone A", "1 Girone A", "1a girone B" etc.
  const match = placeholder.match(/^(\d+)[°ºªoa]?\s*Girone\s+(.+)$/i);
  if (!match) return null;
  return {
    position: parseInt(match[1], 10) - 1,
    groupName: match[2].trim(),
  };
}

/**
 * Parses a general classification placeholder like "1° Classificato" and returns
 * the 0-indexed position.
 */
function parseCategoryPlaceholder(placeholder: string): number | null {
  // Matches "1° Classificato", "1o Classificato", "1 Classificato" etc.
  const match = placeholder.match(/^(\d+)[°ºªoa]?\s*Classificato$/i);
  if (!match) return null;
  return parseInt(match[1], 10) - 1;
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
 */
export function resolvePlaceholders(
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): PlaceholderResolution[] {
  const resolutions: PlaceholderResolution[] = [];

  const unresolvedMatches = allMatches.filter(
    (m) => m.stage !== 'group' && (m.team_home_id === null || m.team_away_id === null)
  );

  console.log('[PlaceholderResolver] Found unresolved matches:', unresolvedMatches.length);

  for (const match of unresolvedMatches) {
    if (match.team_home_id === null && match.placeholder_home) {
      console.log(`[PlaceholderResolver] Checking home placeholder "${match.placeholder_home}" for match ${match.id}`);
      const teamId = resolveOnePlaceholder(match.placeholder_home, match.category_id, allMatches, allTeams);
      if (teamId) {
        console.log(`[PlaceholderResolver] Resolved home to team ID ${teamId}`);
        resolutions.push({ matchId: match.id, side: 'home', teamId });
      }
    }

    if (match.team_away_id === null && match.placeholder_away) {
      console.log(`[PlaceholderResolver] Checking away placeholder "${match.placeholder_away}" for match ${match.id}`);
      const teamId = resolveOnePlaceholder(match.placeholder_away, match.category_id, allMatches, allTeams);
      if (teamId) {
        console.log(`[PlaceholderResolver] Resolved away to team ID ${teamId}`);
        resolutions.push({ matchId: match.id, side: 'away', teamId });
      }
    }
  }

  return resolutions;
}

function resolveOnePlaceholder(
  placeholder: string,
  categoryId: string,
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): string | null {
  // 1. Group placeholder: "X° Girone Y"
  const groupPh = parseGroupPlaceholder(placeholder);
  if (groupPh) {
    return resolveGroupPlaceholder(groupPh.position, groupPh.groupName, categoryId, allMatches, allTeams);
  }

  // 2. Category placeholder: "X° Classificato"
  const catPos = parseCategoryPlaceholder(placeholder);
  if (catPos !== null) {
    return resolveCategoryPlaceholder(catPos, categoryId, allMatches, allTeams);
  }

  // 3. Semifinal placeholder: "Vincente Semifinale N"
  const semiNum = parseSemifinalPlaceholder(placeholder);
  if (semiNum !== null) {
    return resolveSemifinalPlaceholder(semiNum, categoryId, allMatches);
  }

  console.log(`[PlaceholderResolver] Placeholder "${placeholder}" did not match any known pattern.`);
  return null;
}

function resolveGroupPlaceholder(
  position: number,
  groupName: string,
  categoryId: string,
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): string | null {
  const groupTeams = allTeams.filter(
    (t) => t.category_id === categoryId && (t.group_name || 'A').toUpperCase() === groupName.toUpperCase()
  );

  if (groupTeams.length === 0) {
    console.log(`[PlaceholderResolver] No teams found for category ${categoryId} and group ${groupName}`);
    return null;
  }

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

  const allFinished = groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
  
  console.log(`[PlaceholderResolver] Group ${groupName} matches:`, groupMatches.length, 'All finished:', allFinished);
  if (!allFinished) return null;

  const standings = calculateStandings(groupMatches as Match[], groupTeams);
  const tiedTeamIds = findPerfectTies(standings);

  if (position >= 0 && position < standings.length) {
    const candidate = standings[position];
    if (tiedTeamIds.has(candidate.teamId)) {
      console.log(`[PlaceholderResolver] Position ${position + 1} of Group ${groupName} is tied. Cannot resolve placeholder yet.`);
      return null;
    }
    return candidate.teamId;
  }

  return null;
}

function resolveCategoryPlaceholder(
  position: number,
  categoryId: string,
  allMatches: MatchWithDetails[],
  allTeams: Team[],
): string | null {
  const categoryTeams = allTeams.filter((t) => t.category_id === categoryId);
  if (categoryTeams.length === 0) {
    console.log(`[PlaceholderResolver] No teams found for category ${categoryId}`);
    return null;
  }

  const categoryMatches = allMatches.filter(
    (m) =>
      m.category_id === categoryId &&
      m.stage === 'group' &&
      m.team_home_id !== null &&
      m.team_away_id !== null
  );

  const allFinished = categoryMatches.length > 0 && categoryMatches.every((m) => m.status === 'finished');
  console.log(`[PlaceholderResolver] Category matches:`, categoryMatches.length, 'All finished:', allFinished);
  if (!allFinished) return null;

  const standings = calculateStandings(categoryMatches as Match[], categoryTeams);
  const tiedTeamIds = findPerfectTies(standings);

  if (position >= 0 && position < standings.length) {
    const candidate = standings[position];
    if (tiedTeamIds.has(candidate.teamId)) {
      console.log(`[PlaceholderResolver] Position ${position + 1} of Category is tied. Cannot resolve placeholder yet.`);
      return null;
    }
    return candidate.teamId;
  }

  return null;
}

function resolveSemifinalPlaceholder(
  semiNumber: number,
  categoryId: string,
  allMatches: MatchWithDetails[],
): string | null {
  const semis = allMatches
    .filter((m) => m.category_id === categoryId && m.stage === 'semi')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  const targetSemi = semis[semiNumber - 1];
  if (!targetSemi) {
    console.log(`[PlaceholderResolver] Semifinal #${semiNumber} not found.`);
    return null;
  }
  
  console.log(`[PlaceholderResolver] Semifinal #${semiNumber} status: ${targetSemi.status}`);
  if (targetSemi.status !== 'finished') return null;
  if (targetSemi.team_home_id === null || targetSemi.team_away_id === null) return null;

  if (targetSemi.score_home > targetSemi.score_away) {
    return targetSemi.team_home_id;
  } else if (targetSemi.score_away > targetSemi.score_home) {
    return targetSemi.team_away_id;
  }

  console.log(`[PlaceholderResolver] Semifinal #${semiNumber} ended in draw (no winner).`);
  return null;
}

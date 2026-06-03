import type { Match, Team, TeamStanding } from '../types';

/**
 * Calculates standings dynamically from finished matches and list of teams.
 * Sorting order: Points (desc) -> Goal Difference (desc) -> Goals For (desc) -> Manual Rank Priority (desc)
 */
export function calculateStandings(matches: Match[], teams: Team[]): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();

  // 1. Initialize standings for all teams to ensure teams with 0 matches are included
  teams.forEach((team) => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      points: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      manualRankPriority: team.manual_rank_priority || 0,
    });
  });

  // 2. Aggregate results from finished matches
  const finishedMatches = matches.filter((m) => m.status === 'finished');

  finishedMatches.forEach((match) => {
    const home = standingsMap.get(match.team_home_id);
    const away = standingsMap.get(match.team_away_id);

    // Skip if team references are not in the current category/team list (defensive coding)
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.score_home;
    home.goalsAgainst += match.score_away;
    away.goalsFor += match.score_away;
    away.goalsAgainst += match.score_home;

    if (match.score_home > match.score_away) {
      home.points += 3;
      home.won += 1;
      away.lost += 1;
    } else if (match.score_home < match.score_away) {
      away.points += 3;
      away.won += 1;
      home.lost += 1;
    } else {
      home.points += 1;
      away.points += 1;
      home.drawn += 1;
      away.drawn += 1;
    }
  });

  // 3. Compute Goal Difference for each team and convert Map to Array
  const standingsList = Array.from(standingsMap.values()).map((standing) => {
    return {
      ...standing,
      goalDifference: standing.goalsFor - standing.goalsAgainst,
    };
  });

  // 4. Sort standings based on criteria:
  //    - Points (high to low)
  //    - Goal Difference (high to low)
  //    - Goals For (high to low)
  //    - Manual Rank Priority (high to low) - Tie Breaker set by operator
  standingsList.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    if (b.manualRankPriority !== a.manualRankPriority) {
      return b.manualRankPriority - a.manualRankPriority;
    }
    // Final stable fallback (purely visual, perfect tie is flagged in UI)
    return a.teamName.localeCompare(b.teamName);
  });

  return standingsList;
}

/**
 * Checks if there is a perfect tie between two adjacent teams in the standings list
 * (i.e. identical points, goal difference, goals for, and manual priority).
 */
export function findPerfectTies(standings: TeamStanding[]): Set<string> {
  const tiedTeamIds = new Set<string>();
  
  for (let i = 0; i < standings.length - 1; i++) {
    const current = standings[i];
    const next = standings[i + 1];
    
    if (
      current.points === next.points &&
      current.goalDifference === next.goalDifference &&
      current.goalsFor === next.goalsFor &&
      current.manualRankPriority === next.manualRankPriority
    ) {
      tiedTeamIds.add(current.teamId);
      tiedTeamIds.add(next.teamId);
    }
  }
  
  return tiedTeamIds;
}

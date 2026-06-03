import React from 'react';
import type { TeamStanding } from '../types';
import { Trophy, HelpCircle, ArrowUp } from 'lucide-react';

interface LeaderboardTableProps {
  standings: TeamStanding[];
  tiedTeamIds: Set<string>;
  isAdmin: boolean;
  onOpenTieBreaker: (teamA: TeamStanding, teamB: TeamStanding) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  standings,
  tiedTeamIds,
  isAdmin,
  onOpenTieBreaker,
}) => {
  // Find if there are adjacent perfect ties to trigger the operator action
  const renderTieBreakerAction = (index: number) => {
    if (!isAdmin || index >= standings.length - 1) return null;
    
    const teamA = standings[index];
    const teamB = standings[index + 1];
    
    const isPerfectTie =
      teamA.points === teamB.points &&
      teamA.goalDifference === teamB.goalDifference &&
      teamA.goalsFor === teamB.goalsFor &&
      teamA.manualRankPriority === teamB.manualRankPriority;

    if (isPerfectTie) {
      return (
        <button
          onClick={() => onOpenTieBreaker(teamA, teamB)}
          className="ml-2 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white hover:bg-amber-600 animate-pulse"
          title="Risolvi Parità Perfetta come Operatore"
        >
          <HelpCircle className="h-2.5 w-2.5" />
          Risolvi
        </button>
      );
    }
    return null;
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-white">
            1
          </div>
        );
      case 1:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-black text-white">
            2
          </div>
        );
      case 2:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">
            3
          </div>
        );
      default:
        return <span className="text-[10px] font-bold text-slate-400 pl-1.5">{index + 1}</span>;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 sunlight-card">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse text-left font-sans">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
              <th className="py-3 pl-4 pr-1 text-center w-10">Pos</th>
              <th className="py-3 px-3">Squadra</th>
              <th className="py-3 px-2 text-center w-12">Pti</th>
              <th className="py-3 px-2 text-center w-8">G</th>
              <th className="py-3 px-2 text-center w-8">V</th>
              <th className="py-3 px-2 text-center w-8">N</th>
              <th className="py-3 px-2 text-center w-8">P</th>
              <th className="py-3 px-2 text-center w-10">DR</th>
              <th className="py-3 pr-4 pl-2 text-center w-10">GF:GS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs text-slate-700 dark:divide-slate-800/40 dark:text-slate-300">
            {standings.map((team, idx) => {
              const isTied = tiedTeamIds.has(team.teamId);
              const hasManualPriority = team.manualRankPriority > 0;
              
              return (
                <tr
                  key={team.teamId}
                  className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                    idx === 0 ? 'bg-amber-500/5 dark:bg-amber-500/[0.02]' : ''
                  }`}
                >
                  {/* Position */}
                  <td className="py-3 pl-4 pr-1 text-center font-bold">
                    <div className="flex justify-center">{getRankBadge(idx)}</div>
                  </td>

                  {/* Team Name and Badges */}
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span>{team.teamName}</span>
                      
                      {/* Priority Arrow Icon (if tie-breaker is active) */}
                      {hasManualPriority && (
                        <span
                          className="inline-flex items-center rounded-full bg-emerald-100 p-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          title={`Vantaggio manuale assegnato (+${team.manualRankPriority})`}
                        >
                          <ArrowUp className="h-2.5 w-2.5" />
                        </span>
                      )}

                      {/* Perfect Tie Alert Badge */}
                      {isTied && !hasManualPriority && (
                        <span
                          className="rounded bg-amber-100 px-1 py-0.5 text-[8px] font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          title="Questa squadra è in parità perfetta per Punti, DR e GF. È richiesto l'intervento dell'operatore."
                        >
                          SPAREGGIO
                        </span>
                      )}
                      
                      {/* Inline Operator Action Button */}
                      {renderTieBreakerAction(idx)}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-2 text-center font-black text-slate-900 dark:text-white bg-slate-50/30 dark:bg-slate-950/20 text-sm">
                    {team.points}
                  </td>

                  {/* Games Played */}
                  <td className="py-3 px-2 text-center font-medium text-slate-500 dark:text-slate-400">{team.played}</td>
                  
                  {/* Wins */}
                  <td className="py-3 px-2 text-center text-slate-500 dark:text-slate-400">{team.won}</td>
                  
                  {/* Draws */}
                  <td className="py-3 px-2 text-center text-slate-500 dark:text-slate-400">{team.drawn}</td>
                  
                  {/* Losses */}
                  <td className="py-3 px-2 text-center text-slate-500 dark:text-slate-400">{team.lost}</td>

                  {/* Goal Difference */}
                  <td
                    className={`py-3 px-2 text-center font-bold text-xs ${
                      team.goalDifference > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : team.goalDifference < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </td>

                  {/* Goals For & Against */}
                  <td className="py-3 pr-4 pl-2 text-center text-slate-400 dark:text-slate-500 text-[10px]">
                    {team.goalsFor}:{team.goalsAgainst}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Standings Legend */}
      {standings.length > 0 && (
        <div className="bg-slate-50/50 px-4 py-2 text-[9px] font-medium text-slate-400 border-t border-slate-100 dark:bg-slate-950/20 dark:border-slate-800/40 dark:text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>Pti: Punti · G: Giocate · V: Vinte · N: Nulle · P: Perse · DR: Diff. Reti</span>
          </div>
          <span>MVP Montella Tornei</span>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { Category, Team, Match, TeamStanding } from '../types';
import { calculateStandings, findPerfectTies } from '../utils/standings';
import { LeaderboardTable } from './LeaderboardTable';
import { Trophy, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

interface LeaderboardViewProps {
  categories: Category[];
  teams: Team[];
  matches: Match[];
  isAdmin: boolean;
  onSetTeamPriority: (teamId: string, priority: number) => Promise<void> | void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  categories,
  teams,
  matches,
  isAdmin,
  onSetTeamPriority,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tieBreakerTeams, setTieBreakerTeams] = useState<{ teamA: TeamStanding; teamB: TeamStanding } | null>(null);

  // Set default category on load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  
  // Filter teams and matches for the selected category
  const categoryTeams = teams.filter((t) => t.category_id === selectedCategory);
  const categoryMatches = matches.filter((m) => m.category_id === selectedCategory);

  // Group teams by group_name
  const groupedTeams: Record<string, Team[]> = {};
  if (activeCategory) {
    categoryTeams.forEach(t => {
      const g = t.group_name || 'A';
      if (!groupedTeams[g]) groupedTeams[g] = [];
      groupedTeams[g].push(t);
    });
  }
  
  const groups = Object.keys(groupedTeams).sort();

  const handleResolveTie = async (winningTeamId: string) => {
    if (!tieBreakerTeams) return;
    
    // Determine target priority value
    const maxPriority = Math.max(
      tieBreakerTeams.teamA.manualRankPriority,
      tieBreakerTeams.teamB.manualRankPriority
    );
    
    // Set winning team priority to be higher
    await onSetTeamPriority(winningTeamId, maxPriority + 1);
    
    // Close modal
    setTieBreakerTeams(null);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-5">
      
      {/* Category selector chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block px-1">
          Seleziona Categoria
        </span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const color = getCategoryColor(cat.id);
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? `${color.bg} ${color.text} ${color.darkBg} ${color.darkText} ring-2 ${color.border}`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standings Table container */}
      {selectedCategory ? (
        <div className="space-y-4">
          {groups.length > 0 ? (
            <div className="space-y-6">
              {groups.map(groupName => {
                const groupTeams = groupedTeams[groupName];
                const groupMatches = categoryMatches.filter(m => 
                  // Include match if BOTH teams are in this group (for playoffs this might need adjustment later)
                  groupTeams.some(t => t.id === m.team_home_id) && 
                  groupTeams.some(t => t.id === m.team_away_id)
                );
                
                const standings = calculateStandings(groupMatches, groupTeams);
                const tiedTeamIds = findPerfectTies(standings);
                const isMultiGroup = (activeCategory?.groups_count || 1) > 1;

                return (
                  <div key={groupName} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: getCategoryColor(selectedCategory!).hex }}
                      >
                        {isMultiGroup ? `Girone ${groupName}` : `Classifica ${activeCategory?.name}`}
                      </h3>
                      {tiedTeamIds.size > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Pareggio da Risolvere
                        </span>
                      )}
                    </div>
                    {groupTeams.length > 0 ? (
                      <LeaderboardTable
                        standings={standings}
                        tiedTeamIds={tiedTeamIds}
                        isAdmin={isAdmin}
                        onOpenTieBreaker={(teamA, teamB) => setTieBreakerTeams({ teamA, teamB })}
                      />
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-500">Nessuna squadra nel Girone {groupName}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 py-12 px-4 text-center dark:bg-slate-900 dark:border-slate-800/80 sunlight-card">
              <Trophy className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-2" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nessuna squadra trovata
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                Nessuna squadra associata a questa categoria.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 py-12 px-4 text-center dark:bg-slate-900 dark:border-slate-800/80 sunlight-card">
          <Trophy className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-2" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Nessuna categoria selezionata
          </h4>
        </div>
      )}

      {/* Operator Tie Breaker Modal (Overlay) */}
      {tieBreakerTeams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>Risoluzione Parità</span>
              </div>
              <button
                onClick={() => setTieBreakerTeams(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Le squadre <strong>{tieBreakerTeams.teamA.teamName}</strong> e <strong>{tieBreakerTeams.teamB.teamName}</strong> sono in parità assoluta (Punti, DR, Gol Fatti).
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Seleziona quale squadra ha la precedenza in classifica (es. vittoria scontro diretto, sorteggio, ecc.):
              </p>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  onClick={() => handleResolveTie(tieBreakerTeams.teamA.teamId)}
                  className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 transition-all text-left flex items-center justify-between"
                >
                  <span>{tieBreakerTeams.teamA.teamName}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Assegna Vantaggio &rarr;</span>
                </button>
                <button
                  onClick={() => handleResolveTie(tieBreakerTeams.teamB.teamId)}
                  className="w-full rounded-xl bg-sky-50 px-4 py-3 text-xs font-bold text-sky-800 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900 transition-all text-left flex items-center justify-between"
                >
                  <span>{tieBreakerTeams.teamB.teamName}</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400">Assegna Vantaggio &rarr;</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center border-t border-slate-50 dark:border-slate-800">
              L'azione aggiornerà il database riordinando la classifica live.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

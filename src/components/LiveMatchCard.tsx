import React from 'react';
import type { MatchWithDetails } from '../types';
import { Plus, Minus, Tv } from 'lucide-react';

interface LiveMatchCardProps {
  match: MatchWithDetails;
  isAdmin: boolean;
  onUpdateScore?: (matchId: string, scoreHome: number, scoreAway: number) => void;
  onFinishMatch?: (matchId: string) => void;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
  match,
  isAdmin,
  onUpdateScore,
  onFinishMatch,
}) => {
  const handleScoreChange = (team: 'home' | 'away', increment: boolean) => {
    if (!onUpdateScore) return;
    const currentScore = team === 'home' ? match.score_home : match.score_away;
    const newScore = Math.max(0, currentScore + (increment ? 1 : -1));
    
    if (team === 'home') {
      onUpdateScore(match.id, newScore, match.score_away);
    } else {
      onUpdateScore(match.id, match.score_home, newScore);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all duration-300 hover:shadow-lg">
      
      {/* Sunlight optimization: high contrast colored top bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          {match.category?.name || 'Categoria'}
        </span>
        
        {/* Pulsing Live Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black tracking-wider text-white shadow-sm shadow-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Teams and Score Grid */}
        <div className="grid grid-cols-7 items-center gap-2">
          
          {/* Home Team */}
          <div className="col-span-3 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/30 dark:text-emerald-400">
              {match.team_home?.name ? match.team_home.name.substring(0, 2).toUpperCase() : 'C'}
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
              {match.team_home?.name || 'Squadra Casa'}
            </h3>
            
            {/* Operator Score Adjusters */}
            {isAdmin && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleScoreChange('home', false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleScoreChange('home', true)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Core Score Display (High Contrast Sunlight Optimized) */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <span className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {match.score_home}
            </span>
          </div>
          
          <div className="col-span-1 flex flex-col items-center justify-center">
            <span className="text-slate-300 dark:text-slate-700 font-medium text-sm">-</span>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            <span className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {match.score_away}
            </span>
          </div>

          {/* Away Team */}
          <div className="col-span-3 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700 font-bold dark:bg-sky-950/30 dark:text-sky-400">
              {match.team_away?.name ? match.team_away.name.substring(0, 2).toUpperCase() : 'T'}
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
              {match.team_away?.name || 'Squadra Trasferta'}
            </h3>

            {/* Operator Score Adjusters */}
            {isAdmin && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleScoreChange('away', false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleScoreChange('away', true)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Field Details */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Tv className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold">{match.field?.name || 'Campo'}</span>
          </div>
          
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Iniziata: {new Date(match.scheduled_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Finish Match Button for Operators */}
        {isAdmin && onFinishMatch && (
          <button
            onClick={() => onFinishMatch(match.id)}
            className="mt-3 w-full rounded-lg bg-slate-800 py-1.5 text-xs font-bold text-white transition-all hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Termina Incontro
          </button>
        )}
      </div>
    </div>
  );
};

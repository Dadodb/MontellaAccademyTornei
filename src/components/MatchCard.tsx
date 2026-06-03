import React from 'react';
import type { MatchWithDetails, MatchStatus } from '../types';
import { Tv, Flame, CheckCircle, Clock } from 'lucide-react';

interface MatchCardProps {
  match: MatchWithDetails;
  isAdmin: boolean;
  onUpdateStatus?: (matchId: string, status: MatchStatus) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isAdmin,
  onUpdateStatus,
}) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <span className="flex items-center gap-1 rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white animate-pulse">
            <Flame className="h-2.5 w-2.5" />
            LIVE
          </span>
        );
      case 'finished':
        return (
          <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <CheckCircle className="h-2.5 w-2.5 text-slate-500" />
            FINITA
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            <Clock className="h-2.5 w-2.5 text-sky-500" />
            DA DISPUTARE
          </span>
        );
    }
  };

  const formattedTime = new Date(match.scheduled_time).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isHomeWinner = match.status === 'finished' && match.score_home > match.score_away;
  const isAwayWinner = match.status === 'finished' && match.score_away > match.score_home;

  return (
    <div className={`rounded-xl bg-white p-3.5 border transition-all dark:bg-slate-900 sunlight-card ${
      match.status === 'live'
        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/10'
        : 'border-slate-100 dark:border-slate-800/60'
    }`}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 dark:border-slate-800/50">
        {/* Time and Field Info */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {formattedTime}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <Tv className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[100px] sm:max-w-none">{match.field?.name}</span>
          </div>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}
      </div>

      {/* Main Match Competitors Row */}
      <div className="py-3 flex items-center justify-between gap-4">
        {/* Team Home */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm truncate ${
            isHomeWinner 
              ? 'font-bold text-slate-950 dark:text-white' 
              : match.status === 'finished' 
                ? 'text-slate-400 dark:text-slate-500' 
                : 'font-medium text-slate-800 dark:text-slate-200'
          }`}>
            {match.team_home?.name}
          </p>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg dark:bg-slate-950 shrink-0 font-sans">
          {match.status === 'scheduled' ? (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">VS</span>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-black tracking-tight">
              <span className={isHomeWinner ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                {match.score_home}
              </span>
              <span className="text-slate-300 dark:text-slate-700">-</span>
              <span className={isAwayWinner ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                {match.score_away}
              </span>
            </div>
          )}
        </div>

        {/* Team Away */}
        <div className="flex-1 min-w-0 text-right">
          <p className={`text-xs sm:text-sm truncate ${
            isAwayWinner 
              ? 'font-bold text-slate-950 dark:text-white' 
              : match.status === 'finished' 
                ? 'text-slate-400 dark:text-slate-500' 
                : 'font-medium text-slate-800 dark:text-slate-200'
          }`}>
            {match.team_away?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-800/30">
        {/* Category Tag */}
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          {match.category?.name}
        </span>

        {/* Operator Controls inside Calendar */}
        {isAdmin && onUpdateStatus && (
          <div className="flex items-center gap-1.5">
            {match.status === 'scheduled' && (
              <button
                onClick={() => onUpdateStatus(match.id, 'live')}
                className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white hover:bg-emerald-700 transition"
              >
                Avvia Live
              </button>
            )}
            {match.status === 'live' && (
              <button
                onClick={() => onUpdateStatus(match.id, 'finished')}
                className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-black text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
              >
                Termina
              </button>
            )}
            {match.status === 'finished' && (
              <button
                onClick={() => onUpdateStatus(match.id, 'live')}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Ripristina Live
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import type { MatchWithDetails } from '../types';
import { Plus, Minus } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

interface LiveMatchCardProps {
  match: MatchWithDetails;
  isAdmin: boolean;
  onUpdateScore?: (matchId: string, scoreHome: number, scoreAway: number) => void;
  onFinishMatch?: (matchId: string) => void;
}

/** Restituisce le iniziali da un nome squadra (es. "Montella Calcio A" → "MC") */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
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

  const color = getCategoryColor(match.category_id);
  const homeInitials = match.team_home?.name ? getInitials(match.team_home.name) : 'C';
  const awayInitials = match.team_away?.name ? getInitials(match.team_away.name) : 'T';
  const homeName = match.team_home?.name || 'Squadra Casa';
  const awayName = match.team_away?.name || 'Squadra Trasferta';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all duration-300 hover:shadow-lg">

      {/* ── Top bar: Categoria + LIVE badge ── */}
      <div className={`px-4 py-2 flex items-center justify-between border-b border-black/5 dark:border-white/5 ${color.bg} ${color.darkBg}`}>
        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${color.text} ${color.darkText}`}>
          {match.category?.name || 'Categoria'}
        </span>
        <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* ── Score row ── */}
      <div className="flex items-center justify-center gap-4 py-5 px-4">
        {/* Home avatar */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-black dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
            {homeInitials}
          </div>
          <span className="text-center text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 w-full">
            {homeName}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-5xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white leading-none">
            {match.score_home}
          </span>
          <span className="text-xl font-light text-slate-300 dark:text-slate-600 pb-0.5">—</span>
          <span className="text-5xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white leading-none">
            {match.score_away}
          </span>
        </div>

        {/* Away avatar */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-black dark:bg-sky-950/40 dark:text-sky-400 shrink-0">
            {awayInitials}
          </div>
          <span className="text-center text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 w-full">
            {awayName}
          </span>
        </div>
      </div>

      {/* ── Admin controls ── */}
      {isAdmin && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/30">
          {/* Home controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScoreChange('home', false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Casa</span>
            <button
              onClick={() => handleScoreChange('home', true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Center: Finish button */}
          {onFinishMatch && (
            <button
              onClick={() => onFinishMatch(match.id)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white hover:bg-slate-900 active:scale-95 transition dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Termina
            </button>
          )}

          {/* Away controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScoreChange('away', false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Fuori</span>
            <button
              onClick={() => handleScoreChange('away', true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95 transition dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400 dark:hover:bg-sky-950/60"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Footer: orario (solo per utenti normali, non admin) ── */}
      {!isAdmin && (
        <div className="border-t border-slate-50 dark:border-slate-800/50 px-4 py-2 flex justify-end">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Iniziata: {new Date(match.scheduled_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
};

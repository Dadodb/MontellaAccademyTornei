import React from 'react';
import type { Match, Team } from '../types';
import { getTeamColorClasses } from '../utils/teamColors';
import { Calendar, Trophy, Zap } from 'lucide-react';

interface BracketViewProps {
  categoryId: string;
  matches: Match[];
  teams: Team[];
}

export const BracketView: React.FC<BracketViewProps> = ({
  categoryId,
  matches,
  teams,
}) => {
  // Filter matches for this category and stage !== 'group'
  const playoffMatches = matches.filter(
    (m) => m.category_id === categoryId && m.stage !== 'group'
  );

  // Group into Semifinals and Finals
  const semis = playoffMatches
    .filter((m) => m.stage === 'semi')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  const finals = playoffMatches.filter((m) => m.stage === 'final');

  const getTeamName = (teamId: string | null, placeholder: string | null) => {
    if (teamId) {
      const team = teams.find((t) => t.id === teamId);
      return team ? team.name : 'Squadra';
    }
    return placeholder || 'Da definire';
  };

  const getTeamColor = (teamId: string | null) => {
    if (!teamId) return null;
    const team = teams.find((t) => t.id === teamId);
    return team ? team.primary_color : null;
  };

  const renderMatchBox = (match: Match, label: string) => {
    const isFinished = match.status === 'finished';
    const isLive = match.status === 'live';
    
    const homeName = getTeamName(match.team_home_id, match.placeholder_home);
    const awayName = getTeamName(match.team_away_id, match.placeholder_away);
    const homeColor = getTeamColor(match.team_home_id);
    const awayColor = getTeamColor(match.team_away_id);

    const isHomeWinner = isFinished && match.score_home > match.score_away;
    const isAwayWinner = isFinished && match.score_away > match.score_home;

    const formattedTime = new Date(match.scheduled_time).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className={`rounded-xl bg-white border p-3 shadow-sm dark:bg-slate-900 transition-all ${
        isLive 
          ? 'border-rose-400 dark:border-rose-800 bg-rose-50/5 ring-1 ring-rose-300/30' 
          : 'border-slate-100 dark:border-slate-800/80'
      }`}>
        {/* Match Header Label & Time */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-50 dark:border-slate-800/50 mb-2">
          <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            {label}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {isLive ? (
              <span className="flex items-center gap-1 text-rose-500 animate-pulse">
                <Zap className="h-2 w-2 fill-current" />
                LIVE
              </span>
            ) : isFinished ? (
              'FINITA'
            ) : (
              <>
                <Calendar className="h-2 w-2" />
                {formattedTime}
              </>
            )}
          </span>
        </div>

        {/* Home Row */}
        <div className="flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {homeColor ? (
              <div className={`w-2 h-2 rounded-full border ${getTeamColorClasses(homeColor).bg} ${getTeamColorClasses(homeColor).border}`} />
            ) : (
              <div className="w-2 h-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />
            )}
            <span className={`truncate ${
              isHomeWinner ? 'font-bold text-slate-900 dark:text-white' : 
              isFinished ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
            } ${!match.team_home_id ? 'italic opacity-60' : ''}`}>
              {homeName}
            </span>
          </div>
          {!isLive && !isFinished ? (
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1 shrink-0">-</span>
          ) : (
            <span className={`font-black tracking-tight pl-2 shrink-0 ${isHomeWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {match.score_home}
            </span>
          )}
        </div>

        {/* Away Row */}
        <div className="flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {awayColor ? (
              <div className={`w-2 h-2 rounded-full border ${getTeamColorClasses(awayColor).bg} ${getTeamColorClasses(awayColor).border}`} />
            ) : (
              <div className="w-2 h-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />
            )}
            <span className={`truncate ${
              isAwayWinner ? 'font-bold text-slate-900 dark:text-white' : 
              isFinished ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
            } ${!match.team_away_id ? 'italic opacity-60' : ''}`}>
              {awayName}
            </span>
          </div>
          {!isLive && !isFinished ? (
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1 shrink-0">-</span>
          ) : (
            <span className={`font-black tracking-tight pl-2 shrink-0 ${isAwayWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {match.score_away}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (playoffMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 py-12 px-4 text-center dark:bg-slate-900 dark:border-slate-800/80 sunlight-card">
        <Trophy className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-2" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Nessuna fase eliminatoria
        </h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
          Non sono state programmate semifinali o finali per questa categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* 2 Semis and 1 Final layout structure */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4 relative">
        
        {/* Semifinals column */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider px-1">
            Semifinali
          </h4>
          {semis.map((semi, idx) => (
            <div key={semi.id} className="relative">
              {renderMatchBox(semi, `Semifinale ${idx + 1}`)}
            </div>
          ))}
          {semis.length === 0 && (
            <div className="text-xs text-slate-400 italic p-4 text-center">Nessuna semifinale programmata</div>
          )}
        </div>

        {/* Connector arrow/decorations for larger screens */}
        <div className="hidden md:flex items-center justify-center shrink-0 w-8">
          <div className="h-0.5 bg-slate-200 dark:bg-slate-800 w-full" />
        </div>

        {/* Final column */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider px-1">
            Finale
          </h4>
          {finals.map((final) => (
            <div key={final.id}>
              {renderMatchBox(final, 'Finale 1° - 2° Posto')}
            </div>
          ))}
          {finals.length === 0 && (
            <div className="text-xs text-slate-400 italic p-4 text-center">Nessuna finale programmata</div>
          )}
        </div>

      </div>
    </div>
  );
};

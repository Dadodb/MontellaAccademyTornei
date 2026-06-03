import React from 'react';
import type { Field, MatchWithDetails } from '../types';
import { LiveMatchCard } from './LiveMatchCard';
import { CalendarClock, AlertCircle } from 'lucide-react';

interface LiveDashboardProps {
  fields: Field[];
  matches: MatchWithDetails[];
  isAdmin: boolean;
  onUpdateScore: (matchId: string, scoreHome: number, scoreAway: number) => void;
  onFinishMatch: (matchId: string) => void;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  fields,
  matches,
  isAdmin,
  onUpdateScore,
  onFinishMatch,
}) => {
  // Get only the matches currently in 'live' status
  const liveMatches = matches.filter((m) => m.status === 'live');

  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-6">
      
      {/* Realtime Banner Info */}
      <div className="rounded-xl bg-emerald-50/50 p-3.5 border border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/30 flex items-start gap-2.5">
        <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
            Punteggi in tempo reale
          </h4>
          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/80 mt-0.5">
            I risultati si aggiornano automaticamente. Perfetto per seguire i piccoli atleti su tutti i campi contemporaneamente.
          </p>
        </div>
      </div>

      {/* Grid of Fields */}
      <div className="space-y-5">
        {fields.map((field) => {
          // Find the live match currently scheduled on this field
          const liveMatchOnField = liveMatches.find((m) => m.field_id === field.id);

          return (
            <div key={field.id} className="space-y-2">
              {/* Field Header label */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {field.name}
                </span>
              </div>

              {/* Match Card or Empty State */}
              {liveMatchOnField ? (
                <LiveMatchCard
                  match={liveMatchOnField}
                  isAdmin={isAdmin}
                  onUpdateScore={onUpdateScore}
                  onFinishMatch={onFinishMatch}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-8 px-4 text-center dark:border-slate-800 dark:bg-slate-900/40 sunlight-card">
                  <div className="mb-2 rounded-full bg-slate-50 p-2.5 dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nessun incontro in corso
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                    Nessuna partita attiva al momento su questo campo.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

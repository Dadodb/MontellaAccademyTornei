import React, { useState } from 'react';
import type { Category, Field, MatchWithDetails, MatchStatus } from '../types';
import { MatchCard } from './MatchCard';
import { SlidersHorizontal, Info } from 'lucide-react';
import { getCategoryColor } from '../utils/categoryColors';

interface CalendarViewProps {
  categories: Category[];
  fields: Field[];
  matches: MatchWithDetails[];
  isAdmin: boolean;
  onUpdateStatus: (matchId: string, status: MatchStatus) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  categories,
  fields,
  matches,
  isAdmin,
  onUpdateStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');

  // Filter matches
  const filteredMatches = matches
    .filter((match) => {
      const matchesCategory = selectedCategory ? match.category_id === selectedCategory : true;
      const matchesField = selectedField ? match.field_id === selectedField : true;
      const matchesStatus = statusFilter === 'all' ? true : match.status === statusFilter;
      return matchesCategory && matchesField && matchesStatus;
    })
    // Sort chronologically by scheduled time
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-5">
      
      {/* Search and Filters Section */}
      <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80 sunlight-card">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
          <span>Filtri Rapidi</span>
        </div>

        {/* 1. Category Filter Ribbon (Horizontal Scrollable Badges) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Categoria
          </label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Tutte
            </button>
            {categories.map((cat) => {
              const color = getCategoryColor(cat.id);
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
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

        {/* 2. Field Filter Ribbon */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Campo da Gioco
          </label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedField(null)}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                selectedField === null
                  ? 'bg-teal-600 text-white dark:bg-teal-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Tutti i Campi
            </button>
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedField === field.id
                    ? 'bg-teal-600 text-white dark:bg-teal-500'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {field.name.replace(/Campo\s+/, '') /* Shorten field names for mobile layout */}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Status Filter Tabs */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Stato Partita
          </label>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {(['all', 'scheduled', 'live', 'finished'] as const).map((status) => {
              const labelMap = {
                all: 'Tutte',
                scheduled: 'Programmate',
                live: 'In Corso',
                finished: 'Finite',
              };
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded py-1 text-[10px] font-bold uppercase transition-all ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {labelMap[status]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3.5">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isAdmin={isAdmin}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 py-12 px-4 text-center dark:bg-slate-900 dark:border-slate-800/80 sunlight-card">
            <Info className="h-6 w-6 text-slate-400 dark:text-slate-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nessun incontro trovato
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[220px]">
              Prova a cambiare i filtri per visualizzare altri incontri in calendario.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

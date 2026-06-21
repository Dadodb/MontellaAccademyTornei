import type { TeamColor } from '../types';

export const TEAM_COLORS: Record<TeamColor, { label: string; bg: string; text: string; border: string }> = {
  white: { label: 'Bianco', bg: 'bg-white', text: 'text-slate-800', border: 'border-slate-200' },
  black: { label: 'Nero', bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' },
  red: { label: 'Rosso', bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  blue: { label: 'Blu', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  sky: { label: 'Azzurro', bg: 'bg-sky-400', text: 'text-white', border: 'border-sky-500' },
  emerald: { label: 'Verde', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  yellow: { label: 'Giallo', bg: 'bg-yellow-400', text: 'text-slate-900', border: 'border-yellow-500' },
  orange: { label: 'Arancione', bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  purple: { label: 'Viola', bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  slate: { label: 'Grigio', bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-600' },
};

export const getTeamColorClasses = (color: TeamColor | null | undefined) => {
  return TEAM_COLORS[color || 'slate'];
};

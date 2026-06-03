import React from 'react';
import { Sun, Moon, Flame, Activity, Shield, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isMock: boolean;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  setIsDark,
  isMock,
  isAdmin,
  setIsAdmin,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 sunlight-card transition-all">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20 dark:shadow-emerald-950/30">
            <Flame className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              MONTELLA
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Tornei Giovanili
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all ${
              isMock
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
            title={isMock ? 'Esecuzione con Dati Demo (Locale)' : 'Connesso in tempo reale a Supabase'}
          >
            <Activity className={`h-3 w-3 ${isMock ? 'text-amber-500' : 'text-emerald-500 animate-pulse'}`} />
            <span>{isMock ? 'DEMO' : 'LIVE'}</span>
          </div>

          {/* Operator Mode Toggle */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              isAdmin
                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
            }`}
            title={isAdmin ? 'Disattiva Modalità Operatore' : 'Attiva Modalità Operatore'}
          >
            {isAdmin ? <Shield className="h-4.5 w-4.5" /> : <ShieldAlert className="h-4.5 w-4.5" />}
          </button>

          {/* Theme Toggle (Sunlight Optimization) */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isDark ? 'Passa a Modalità Chiara (Ideale sotto il sole)' : 'Passa a Modalità Scura'}
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

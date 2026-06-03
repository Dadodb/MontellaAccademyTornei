import React from 'react';
import { Activity, Calendar, Trophy } from 'lucide-react';

export type TabId = 'live' | 'calendar' | 'standings';

interface TabNavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  liveCount: number; // Show number of active live matches in a badge!
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  liveCount,
}) => {
  const tabs = [
    {
      id: 'live' as TabId,
      label: 'Ora in Campo',
      icon: Activity,
      badge: liveCount > 0 ? liveCount : undefined,
    },
    {
      id: 'calendar' as TabId,
      label: 'Calendario',
      icon: Calendar,
    },
    {
      id: 'standings' as TabId,
      label: 'Classifiche',
      icon: Trophy,
    },
  ];

  return (
    <div className="sticky top-16 z-40 w-full bg-slate-50/95 backdrop-blur-sm dark:bg-slate-950/95 py-2 px-4 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto max-w-lg">
        <nav className="flex space-x-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-900/60" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex flex-1 flex-col items-center justify-center rounded-lg py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4.5 w-4.5 transition-transform group-active:scale-95 ${
                    isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`} />
                  <span className="font-sans tracking-wide">{tab.label}</span>
                  
                  {/* Live matches counter badge */}
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-slate-50 dark:ring-slate-950 animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

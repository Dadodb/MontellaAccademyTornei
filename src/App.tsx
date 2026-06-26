import { useState, useEffect } from 'react';
import { supabase, isMockMode } from './lib/supabaseClient';
import type { Category, Field, Team, MatchWithDetails, MatchStatus, TeamColor } from './types';
import { Navbar } from './components/Navbar';
import type { TabId } from './components/TabNavigation';
import { TabNavigation } from './components/TabNavigation';
import { LiveDashboard } from './components/LiveDashboard';
import { CalendarView } from './components/CalendarView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader2, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Primi Calci 2018', groups_count: 1 },
  { id: 'cat-2', name: 'Pulcini 2015', groups_count: 1 },
  { id: 'cat-3', name: 'Esordienti 2013', groups_count: 1 },
];

const MOCK_FIELDS: Field[] = [
  { id: 'field-a', name: 'Campo A (Tribuna Destra)' },
  { id: 'field-b', name: 'Campo B (Lato Spogliatoi)' },
  { id: 'field-calcetto', name: 'Campo Calcetto (Sintetico)' },
];

const MOCK_TEAMS: Team[] = [
  // Primi Calci 2018
  { id: 't-1', name: 'Montella Calcio A', category_id: 'cat-1', group_name: 'A', primary_color: 'red', manual_rank_priority: 0 },
  { id: 't-2', name: 'Virtus Avellino', category_id: 'cat-1', group_name: 'A', primary_color: 'white', manual_rank_priority: 0 },
  { id: 't-3', name: 'Lioni FC', category_id: 'cat-1', group_name: 'A', primary_color: 'red', manual_rank_priority: 0 },
  { id: 't-4', name: 'Bagnoli Calcio', category_id: 'cat-1', group_name: 'A', primary_color: 'blue', manual_rank_priority: 0 },
  // Pulcini 2015
  { id: 't-5', name: 'Montella Calcio B', category_id: 'cat-2', group_name: 'A', primary_color: 'red', manual_rank_priority: 0 },
  { id: 't-6', name: 'Nusco Academy', category_id: 'cat-2', group_name: 'A', primary_color: 'sky', manual_rank_priority: 0 },
  { id: 't-7', name: 'Solofra Calcio', category_id: 'cat-2', group_name: 'A', primary_color: 'yellow', manual_rank_priority: 0 },
  { id: 't-8', name: 'Atripalda FC', category_id: 'cat-2', group_name: 'A', primary_color: 'emerald', manual_rank_priority: 0 },
  // Esordienti 2013
  { id: 't-9', name: 'Montella Calcio C', category_id: 'cat-3', group_name: 'A', primary_color: 'red', manual_rank_priority: 0 },
  { id: 't-10', name: 'Torella Calcio', category_id: 'cat-3', group_name: 'A', primary_color: 'black', manual_rank_priority: 0 },
  { id: 't-11', name: 'Volturara FC', category_id: 'cat-3', group_name: 'A', primary_color: 'orange', manual_rank_priority: 0 },
  { id: 't-12', name: 'Calitri Calcio', category_id: 'cat-3', group_name: 'A', primary_color: 'purple', manual_rank_priority: 0 },
];

const now = new Date();
const MOCK_MATCHES_RAW = [
  // Primi Calci 2018
  {
    id: 'm-1',
    category_id: 'cat-1',
    field_id: 'field-a',
    team_home_id: 't-1',
    team_away_id: 't-2',
    score_home: 2,
    score_away: 1,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    started_at: null,
    status: 'finished' as MatchStatus,
  },
  {
    id: 'm-2',
    category_id: 'cat-1',
    field_id: 'field-b',
    team_home_id: 't-3',
    team_away_id: 't-4',
    score_home: 1,
    score_away: 1,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    started_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // live since 10 min ago
    status: 'live' as MatchStatus,
  },
  // Pulcini 2015
  {
    id: 'm-3',
    category_id: 'cat-2',
    field_id: 'field-calcetto',
    team_home_id: 't-5',
    team_away_id: 't-6',
    score_home: 0,
    score_away: 0,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
    started_at: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // live since 20 min ago
    status: 'live' as MatchStatus,
  },
  {
    id: 'm-4',
    category_id: 'cat-2',
    field_id: 'field-a',
    team_home_id: 't-7',
    team_away_id: 't-8',
    score_home: 0,
    score_away: 0,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
    started_at: null,
    status: 'scheduled' as MatchStatus,
  },
  // Esordienti 2013
  {
    id: 'm-5',
    category_id: 'cat-3',
    field_id: 'field-b',
    team_home_id: 't-9',
    team_away_id: 't-10',
    score_home: 3,
    score_away: 0,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    started_at: null,
    status: 'finished' as MatchStatus,
  },
  {
    id: 'm-6',
    category_id: 'cat-3',
    field_id: 'field-calcetto',
    team_home_id: 't-11',
    team_away_id: 't-12',
    score_home: 0,
    score_away: 0,
    team_home_color: null,
    team_away_color: null,
    scheduled_time: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
    started_at: null,
    status: 'scheduled' as MatchStatus,
  },
];

function expandMockMatch(match: typeof MOCK_MATCHES_RAW[0]): MatchWithDetails {
  return {
    ...match,
    placeholder_home: null,
    placeholder_away: null,
    stage: 'group',
    category: MOCK_CATEGORIES.find((c) => c.id === match.category_id)!,
    field: MOCK_FIELDS.find((f) => f.id === match.field_id)!,
    team_home: MOCK_TEAMS.find((t) => t.id === match.team_home_id) || null,
    team_away: MOCK_TEAMS.find((t) => t.id === match.team_away_id) || null,
  };
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const [isAdmin, setIsAdmin] = useState(false);

  // Field conflict modal state
  const [fieldConflictModal, setFieldConflictModal] = useState<{
    matchId: string;
    matchLabel: string;
    occupiedField: Field;
    conflictingMatch: MatchWithDetails;
    freeFields: Field[];
  } | null>(null);

  // Team conflict modal state
  const [teamConflictModal, setTeamConflictModal] = useState<{
    matchId: string;
    matchLabel: string;
    conflictingMatch: MatchWithDetails;
    teamName: string;
  } | null>(null);

  // Color conflict modal state
  const [colorConflictModal, setColorConflictModal] = useState<{
    matchId: string;
    matchLabel: string;
    teamHomeName: string;
    teamAwayName: string;
    conflictColor: string;
  } | null>(null);
  
  // Sunlight Optimization State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode CSS class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load Initial Data
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Load mock dataset locally
        setCategories(MOCK_CATEGORIES);
        setFields(MOCK_FIELDS);
        setTeams(MOCK_TEAMS);
        setMatches(MOCK_MATCHES_RAW.map(expandMockMatch));
        setLoading(false);
        return;
      }

      // Fetch from Supabase
      const [catRes, fieldRes, teamRes, matchRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('fields').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
        supabase.from('matches').select(`
          *,
          category:categories(*),
          field:fields(*),
          team_home:teams!team_home_id(*),
          team_away:teams!team_away_id(*)
        `),
      ]);

      if (catRes.error) throw catRes.error;
      if (fieldRes.error) throw fieldRes.error;
      if (teamRes.error) throw teamRes.error;
      if (matchRes.error) throw matchRes.error;

      setCategories(catRes.data || []);
      setFields(fieldRes.data || []);
      setTeams(teamRes.data || []);
      setMatches((matchRes.data as unknown as MatchWithDetails[]) || []);
    } catch (err: any) {
      console.error('Errore caricamento dati:', err);
      setError(err.message || 'Si è verificato un errore nel caricamento dei dati.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Supabase Real-time subscriptions & Mock Interval Syncing
  useEffect(() => {
    if (isMockMode) {
      // Simulation mode: Randomly increment scores of live matches every 5 seconds
      const interval = setInterval(() => {
        setMatches((prevMatches) =>
          prevMatches.map((m) => {
            if (m.status !== 'live') return m;
            
            // 20% chance to update score on tick
            if (Math.random() > 0.25) return m;

            const incrementHome = Math.random() > 0.5;
            return {
              ...m,
              score_home: incrementHome ? m.score_home + 1 : m.score_home,
              score_away: !incrementHome ? m.score_away + 1 : m.score_away,
            };
          })
        );
      }, 5000);

      return () => clearInterval(interval);
    }

    // Supabase channels setup for Realtime
    const handleTableChange = () => {
      // Re-fetch complete matches lists when matches, fields, or teams update
      supabase
        .from('matches')
        .select(`
          *,
          category:categories(*),
          field:fields(*),
          team_home:teams!team_home_id(*),
          team_away:teams!team_away_id(*)
        `)
        .then(({ data }) => {
          if (data) setMatches(data as unknown as MatchWithDetails[]);
        });
    };

    const handleTeamsChange = () => {
      supabase
        .from('teams')
        .select('*')
        .order('name')
        .then(({ data }) => {
          if (data) setTeams(data);
        });
    };

    const handleFieldsChange = () => {
      supabase
        .from('fields')
        .select('*')
        .order('name')
        .then(({ data }) => {
          if (data) setFields(data);
        });
    };

    const channel = supabase
      .channel('supabase-realtime-tournament')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, handleTableChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, handleTeamsChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fields' }, handleFieldsChange)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categories]);

  // Operator Action implementations
  const handleUpdateScore = async (matchId: string, scoreHome: number, scoreAway: number) => {
    // Optimistic update per UI fluida
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, score_home: scoreHome, score_away: scoreAway } : m))
    );

    if (!isMockMode) {
      try {
        const { error, data } = await supabase
          .from('matches')
          .update({ score_home: scoreHome, score_away: scoreAway })
          .eq('id', matchId)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error("Nessuna riga aggiornata. Controlla di aver eseguito la policy UPDATE per 'matches' nel database.");
        }
      } catch (err: any) {
        alert(`Errore aggiornamento score: ${err.message}`);
        loadInitialData(); // Revert
      }
    }
  };

  // Low-level: actually set a match to live (optionally reassigning field first)
  const doStartLive = async (matchId: string, newFieldId?: string, homeColorOverride?: string, awayColorOverride?: string) => {
    const startedAt = new Date().toISOString();
    const updatePayload: Record<string, unknown> = { status: 'live', started_at: startedAt };
    if (newFieldId) updatePayload.field_id = newFieldId;
    if (homeColorOverride) updatePayload.team_home_color = homeColorOverride;
    if (awayColorOverride) updatePayload.team_away_color = awayColorOverride;

    // Optimistic update
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'live' as MatchStatus,
              started_at: startedAt,
              field_id: newFieldId ?? m.field_id,
              field: newFieldId ? (fields.find((f) => f.id === newFieldId) ?? m.field) : m.field,
              team_home_color: homeColorOverride ? (homeColorOverride as any) : m.team_home_color,
              team_away_color: awayColorOverride ? (awayColorOverride as any) : m.team_away_color,
            }
          : m
      )
    );

    if (!isMockMode) {
      try {
        const { error, data } = await supabase
          .from('matches')
          .update(updatePayload)
          .eq('id', matchId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error("Nessuna riga aggiornata. Controlla la policy UPDATE per 'matches'.");
        }
      } catch (err: any) {
        alert(`Errore avvio partita: ${err.message}`);
        loadInitialData();
      }
    }
  };

  const handleUpdateStatus = async (matchId: string, status: MatchStatus) => {
    // Only intercept the 'live' transition for conflicts checks
    if (status === 'live') {
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        const matchLabel = `${match.team_home?.name ?? match.placeholder_home ?? 'Casa'} vs ${match.team_away?.name ?? match.placeholder_away ?? 'Trasferta'}`;

        // 0. Check Team Conflict (Is any team already playing?)
        const teamHomeId = match.team_home_id;
        const teamAwayId = match.team_away_id;
        if (teamHomeId || teamAwayId) {
          const conflictingTeamMatch = matches.find(
            (m) => m.id !== matchId && m.status === 'live' && 
            (m.team_home_id === teamHomeId || m.team_away_id === teamHomeId || m.team_home_id === teamAwayId || m.team_away_id === teamAwayId)
          );
          
          if (conflictingTeamMatch) {
            const conflictingTeamId = (conflictingTeamMatch.team_home_id === teamHomeId || conflictingTeamMatch.team_away_id === teamHomeId) ? teamHomeId : teamAwayId;
            const teamName = conflictingTeamId === teamHomeId ? (match.team_home?.name ?? 'Casa') : (match.team_away?.name ?? 'Trasferta');
            
            setTeamConflictModal({
              matchId,
              matchLabel,
              conflictingMatch: conflictingTeamMatch,
              teamName,
            });
            return; // Stop here
          }
        }

        // 1. Check Field Conflict
        const conflicting = matches.find(
          (m) => m.id !== matchId && m.field_id === match.field_id && m.status === 'live'
        );
        if (conflicting) {
          // Find fields that have NO live match
          const busyFieldIds = new Set(matches.filter((m) => m.status === 'live').map((m) => m.field_id));
          const freeFields = fields.filter((f) => !busyFieldIds.has(f.id) && f.id !== match.field_id);
          setFieldConflictModal({
            matchId,
            matchLabel,
            occupiedField: match.field ?? { id: match.field_id, name: match.field_id },
            conflictingMatch: conflicting,
            freeFields,
          });
          return; // Stop here — wait for modal decision
        }

        // 2. Check Color Conflict
        if (match.team_home && match.team_away && match.team_home.primary_color === match.team_away.primary_color) {
          const matchLabel = `${match.team_home.name} vs ${match.team_away.name}`;
          setColorConflictModal({
            matchId,
            matchLabel,
            teamHomeName: match.team_home.name,
            teamAwayName: match.team_away.name,
            conflictColor: match.team_home.primary_color
          });
          return; // Stop here — wait for modal decision
        }
      }
      // No conflict — start directly
      doStartLive(matchId);
      return;
    }

    // For all other status transitions (finished, scheduled) use normal flow
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status } : m))
    );

    if (!isMockMode) {
      try {
        const { error, data } = await supabase
          .from('matches')
          .update({ status })
          .eq('id', matchId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error("Nessuna riga aggiornata. Controlla la policy UPDATE per 'matches'.");
        }
      } catch (err: any) {
        alert(`Errore cambio stato: ${err.message}`);
        loadInitialData();
      }
    }
  };

  const handleFinishMatch = (matchId: string) => {
    handleUpdateStatus(matchId, 'finished');
  };

  const handleGenerateCalendar = async (
    startTime: string,
    matchDuration: number,
    breakDuration: number,
    generatePlayoffs: boolean
  ) => {
    try {
      const [startHour, startMin] = startTime.split(':').map(Number);
      let currentTime = new Date();
      currentTime.setHours(startHour, startMin, 0, 0);

      const newMatchesRaw: any[] = [];
      const matchesToSchedule: { category: string; home: string; away: string }[] = [];

      // 1. Generate all matchups across ALL categories
      categories.forEach(cat => {
        const categoryTeams = teams.filter(t => t.category_id === cat.id);
        const groups: Record<string, Team[]> = {};
        categoryTeams.forEach(t => {
          const g = t.group_name || 'A';
          if (!groups[g]) groups[g] = [];
          groups[g].push(t);
        });

        Object.keys(groups).forEach(groupName => {
          const groupTeams = groups[groupName];
          for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
              const exists = matches.some(m => 
                (m.team_home_id === groupTeams[i].id && m.team_away_id === groupTeams[j].id) ||
                (m.team_home_id === groupTeams[j].id && m.team_away_id === groupTeams[i].id)
              );
              if (!exists) {
                matchesToSchedule.push({ category: cat.id, home: groupTeams[i].id, away: groupTeams[j].id });
              }
            }
          }
        });
      });

      // 2. Distribute matches across fields and timeslots
      const availableFields = fields.length > 0 ? fields : [{ id: null as unknown as string, name: 'Default' }];

      while (matchesToSchedule.length > 0) {
        const teamsPlayingInThisSlot = new Set<string>();

        for (const field of availableFields) {
          if (matchesToSchedule.length === 0) break;

          const matchIndex = matchesToSchedule.findIndex(m => 
            !teamsPlayingInThisSlot.has(m.home) && !teamsPlayingInThisSlot.has(m.away)
          );

          if (matchIndex !== -1) {
            const m = matchesToSchedule[matchIndex];
            matchesToSchedule.splice(matchIndex, 1);
            teamsPlayingInThisSlot.add(m.home);
            teamsPlayingInThisSlot.add(m.away);
            
            newMatchesRaw.push({
              category_id: m.category,
              field_id: field.id,
              team_home_id: m.home,
              team_away_id: m.away,
              placeholder_home: null,
              placeholder_away: null,
              stage: 'group',
              score_home: 0,
              score_away: 0,
              scheduled_time: new Date(currentTime).toISOString(),
              status: 'scheduled'
            });
          }
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + matchDuration + breakDuration);
      }

      // 3. Add Playoffs if requested (Concurrent across categories)
      if (generatePlayoffs) {
        const semiFinalsToSchedule: { category: string; homePlaceholder: string; awayPlaceholder: string }[] = [];
        const finalsToSchedule: { category: string; homePlaceholder: string; awayPlaceholder: string }[] = [];

        categories.forEach(cat => {
          const categoryTeams = teams.filter(t => t.category_id === cat.id);
          const groups: Record<string, Team[]> = {};
          categoryTeams.forEach(t => {
            const g = t.group_name || 'A';
            if (!groups[g]) groups[g] = [];
            groups[g].push(t);
          });
          const groupKeys = Object.keys(groups).sort();
          
          if (groupKeys.length === 2) {
            semiFinalsToSchedule.push({
              category: cat.id,
              homePlaceholder: `1° Girone ${groupKeys[0]}`,
              awayPlaceholder: `2° Girone ${groupKeys[1]}`
            });
            semiFinalsToSchedule.push({
              category: cat.id,
              homePlaceholder: `1° Girone ${groupKeys[1]}`,
              awayPlaceholder: `2° Girone ${groupKeys[0]}`
            });
          }

          finalsToSchedule.push({
            category: cat.id,
            homePlaceholder: groupKeys.length === 2 ? 'Vincente Semifinale 1' : '1° Classificato',
            awayPlaceholder: groupKeys.length === 2 ? 'Vincente Semifinale 2' : '2° Classificato'
          });
        });

        // Schedule all Semifinals
        while (semiFinalsToSchedule.length > 0) {
          for (const field of availableFields) {
            if (semiFinalsToSchedule.length === 0) break;
            const semi = semiFinalsToSchedule.shift()!;
            newMatchesRaw.push({
              category_id: semi.category,
              field_id: field.id,
              team_home_id: null,
              team_away_id: null,
              placeholder_home: semi.homePlaceholder,
              placeholder_away: semi.awayPlaceholder,
              stage: 'semi',
              score_home: 0,
              score_away: 0,
              scheduled_time: new Date(currentTime).toISOString(),
              status: 'scheduled'
            });
          }
          currentTime.setMinutes(currentTime.getMinutes() + matchDuration + breakDuration);
        }

        // Schedule all Finals
        while (finalsToSchedule.length > 0) {
          for (const field of availableFields) {
            if (finalsToSchedule.length === 0) break;
            const finalMatch = finalsToSchedule.shift()!;
            newMatchesRaw.push({
              category_id: finalMatch.category,
              field_id: field.id,
              team_home_id: null,
              team_away_id: null,
              placeholder_home: finalMatch.homePlaceholder,
              placeholder_away: finalMatch.awayPlaceholder,
              stage: 'final',
              score_home: 0,
              score_away: 0,
              scheduled_time: new Date(currentTime).toISOString(),
              status: 'scheduled'
            });
          }
          currentTime.setMinutes(currentTime.getMinutes() + matchDuration + breakDuration);
        }
      }

      if (isMockMode) {
        alert('Calendario generato (Modalità Demo - i dati non vengono salvati). Ricarica per azzerare.');
        return;
      }

      if (newMatchesRaw.length > 0) {
        const { error } = await supabase.from('matches').insert(newMatchesRaw);
        if (error) throw error;
        loadInitialData();
      }

    } catch (error) {
      console.error('Error generating calendar:', error);
      throw error;
    }
  };
  const handleDeleteAllMatches = async () => {
    if (isMockMode) { alert("Modalità Demo: I dati non vengono realmente cancellati."); setMatches([]); return; }
    try {
      const { error } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      loadInitialData();
    } catch (error) { throw error; }
  };

  const handleDeleteAllTeams = async () => {
    if (isMockMode) { alert("Modalità Demo: I dati non vengono realmente cancellati."); setTeams([]); return; }
    try {
      const { error } = await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      loadInitialData();
    } catch (error) { throw error; }
  };

  const handleDeleteAllFields = async () => {
    if (isMockMode) { alert("Modalità Demo: I dati non vengono realmente cancellati."); setFields([]); return; }
    try {
      const { error } = await supabase.from('fields').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      loadInitialData();
    } catch (error) { throw error; }
  };

  const handleDeleteAllCategories = async () => {
    if (isMockMode) { alert("Modalità Demo: I dati non vengono realmente cancellati."); setCategories([]); return; }
    try {
      const { error } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      loadInitialData();
    } catch (error) { throw error; }
  };

  const handleSetTeamPriority = async (teamId: string, priority: number) => {
    if (isMockMode) {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, manual_rank_priority: priority } : t))
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .update({ manual_rank_priority: priority })
        .eq('id', teamId);
      if (error) throw error;
    } catch (err: any) {
      alert(`Errore salvataggio priorità: ${err.message}`);
    }
  };

  const handleAddCategory = async (name: string, groupsCount: number) => {
    if (isMockMode) {
      const newCategory = { id: `c-${Date.now()}`, name, groups_count: groupsCount };
      setCategories((prev) => [...prev, newCategory]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, groups_count: groupsCount }])
        .select()
        .single();
      if (error) throw error;
      setCategories([...categories, data]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (id: string, name: string, groupsCount: number) => {
    if (isMockMode) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, groups_count: groupsCount } : c)));
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, groups_count: groupsCount })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? data : c));
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (isMockMode) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddField = async (name: string) => {
    if (isMockMode) {
      const newField = { id: `f-${Date.now()}`, name };
      setFields((prev) => [...prev, newField]);
      return;
    }
    const { data, error } = await supabase.from('fields').insert([{ name }]).select().single();
    if (error) throw error;
    setFields((prev) => [...prev, data]);
  };

  const handleUpdateField = async (id: string, name: string) => {
    if (isMockMode) {
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
      return;
    }
    const { error } = await supabase.from('fields').update({ name }).eq('id', id);
    if (error) throw error;
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleDeleteField = async (id: string) => {
    if (isMockMode) {
      setFields((prev) => prev.filter((f) => f.id !== id));
      return;
    }
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) throw error;
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddTeam = async (name: string, categoryId: string, groupName: string, primaryColor: TeamColor) => {
    if (isMockMode) {
      const newTeam = { id: `t-${Date.now()}`, name, category_id: categoryId, group_name: groupName, primary_color: primaryColor, manual_rank_priority: 0 };
      setTeams((prev) => [...prev, newTeam]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, category_id: categoryId, group_name: groupName, primary_color: primaryColor, manual_rank_priority: 0 }])
        .select()
        .single();
      if (error) throw error;
      setTeams([...teams, data]);
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  };

  const handleUpdateTeam = async (id: string, name: string, categoryId: string, groupName: string, primaryColor: TeamColor) => {
    if (isMockMode) {
      setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name, category_id: categoryId, group_name: groupName, primary_color: primaryColor } : t)));
      return;
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ name, category_id: categoryId, group_name: groupName, primary_color: primaryColor })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setTeams(teams.map(t => t.id === id ? data : t));
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (isMockMode) {
      setTeams((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Header Navigation */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        isMock={isMockMode}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveCount={liveMatchesCount}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-16">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <span className="text-xs font-bold text-slate-400">Caricamento Torneo...</span>
          </div>
        )}

        {/* Error Screen */}
        {error && !loading && (
          <div className="mx-auto max-w-sm px-4 py-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Caricamento fallito</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
            </div>
            <button
              onClick={loadInitialData}
              className="mx-auto flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Riprova</span>
            </button>
          </div>
        )}

        {/* Tab Contents */}
        {!loading && !error && (
          <>
            {activeTab === 'live' && (
              <LiveDashboard
                fields={fields}
                matches={matches}
                isAdmin={isAdmin}
                onUpdateScore={handleUpdateScore}
                onFinishMatch={handleFinishMatch}
              />
            )}
            
            {activeTab === 'calendar' && (
              <CalendarView
                categories={categories}
                fields={fields}
                matches={matches}
                isAdmin={isAdmin}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            
            {activeTab === 'standings' && (
              <LeaderboardView
                categories={categories}
                teams={teams}
                matches={matches}
                isAdmin={isAdmin}
                onSetTeamPriority={handleSetTeamPriority}
              />
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard
                categories={categories}
                teams={teams}
                fields={fields}
                matches={matches}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddField={handleAddField}
                onUpdateField={handleUpdateField}
                onDeleteField={handleDeleteField}
                onAddTeam={handleAddTeam}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onGenerateCalendar={handleGenerateCalendar}
                onDeleteAllMatches={handleDeleteAllMatches}
                onDeleteAllTeams={handleDeleteAllTeams}
                onDeleteAllFields={handleDeleteAllFields}
                onDeleteAllCategories={handleDeleteAllCategories}
              />
            )}
          </>
        )}
      </main>

      {/* Team Conflict Modal */}
      {teamConflictModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Squadra già in campo</h3>
                <p className="text-[11px] text-rose-600 dark:text-rose-500 leading-tight mt-0.5">
                  {teamConflictModal.matchLabel}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                La squadra <strong>{teamConflictModal.teamName}</strong> sta già giocando una partita (<strong>{teamConflictModal.conflictingMatch.team_home?.name} vs {teamConflictModal.conflictingMatch.team_away?.name}</strong>).
                {teamConflictModal.conflictingMatch.started_at && (
                  <span className="block mt-1">
                    Questa partita è iniziata da <strong>{Math.floor((Date.now() - new Date(teamConflictModal.conflictingMatch.started_at).getTime()) / 60000)} minuti</strong>.
                  </span>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
              <button
                onClick={() => setTeamConflictModal(null)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={async () => {
                  const conflictingMatchId = teamConflictModal.conflictingMatch.id;
                  const matchIdToStart = teamConflictModal.matchId;
                  setTeamConflictModal(null);
                  
                  // Finish old match then trigger status update for the new one to run checks again
                  await handleUpdateStatus(conflictingMatchId, 'finished');
                  await handleUpdateStatus(matchIdToStart, 'live');
                }}
                className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-all"
              >
                Termina vecchia e Avvia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Conflict Modal */}
      {fieldConflictModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Campo già occupato</h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-tight mt-0.5">
                  {fieldConflictModal.occupiedField.name}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sul campo <strong>{fieldConflictModal.occupiedField.name}</strong> è già in corso un'altra partita: <strong>{fieldConflictModal.conflictingMatch.team_home?.name} vs {fieldConflictModal.conflictingMatch.team_away?.name}</strong>.
                {fieldConflictModal.conflictingMatch.started_at && (
                  <span className="block mt-1">
                    Iniziata da <strong>{Math.floor((Date.now() - new Date(fieldConflictModal.conflictingMatch.started_at).getTime()) / 60000)} minuti</strong>.
                  </span>
                )}
              </p>

              {fieldConflictModal.freeFields.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Scegli un campo libero:
                  </p>
                  {fieldConflictModal.freeFields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => {
                        doStartLive(fieldConflictModal.matchId, field.id);
                        setFieldConflictModal(null);
                      }}
                      className="w-full flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-3 py-2.5 text-left text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all"
                    >
                      <span>{field.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        Usa questo
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-3 py-2.5">
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    Nessun campo libero disponibile.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
              <button
                onClick={() => setFieldConflictModal(null)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={async () => {
                  const oldMatchId = fieldConflictModal.conflictingMatch.id;
                  const newMatchId = fieldConflictModal.matchId;
                  setFieldConflictModal(null);
                  
                  await handleUpdateStatus(oldMatchId, 'finished');
                  await handleUpdateStatus(newMatchId, 'live');
                }}
                className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-all"
              >
                Termina e Avvia qui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Conflict Modal */}
      {colorConflictModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Conflitto Colori Maglie</h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-tight mt-0.5">
                  {colorConflictModal.matchLabel}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Le squadre hanno lo stesso colore di maglia. Assegna una <strong>Pettorina</strong> a una delle due squadre per questa partita.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold text-slate-500 text-center">{colorConflictModal.teamHomeName}</p>
                  <button
                    onClick={() => {
                      doStartLive(colorConflictModal.matchId, undefined, 'yellow', undefined);
                      setColorConflictModal(null);
                    }}
                    className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-yellow-500 transition-all border border-yellow-500"
                  >
                    Pettorina Gialla
                  </button>
                  <button
                    onClick={() => {
                      doStartLive(colorConflictModal.matchId, undefined, 'orange', undefined);
                      setColorConflictModal(null);
                    }}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all border border-orange-600"
                  >
                    Pettorina Arancione
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold text-slate-500 text-center">{colorConflictModal.teamAwayName}</p>
                  <button
                    onClick={() => {
                      doStartLive(colorConflictModal.matchId, undefined, undefined, 'yellow');
                      setColorConflictModal(null);
                    }}
                    className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-yellow-500 transition-all border border-yellow-500"
                  >
                    Pettorina Gialla
                  </button>
                  <button
                    onClick={() => {
                      doStartLive(colorConflictModal.matchId, undefined, undefined, 'orange');
                      setColorConflictModal(null);
                    }}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all border border-orange-600"
                  >
                    Pettorina Arancione
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
              <button
                onClick={() => setColorConflictModal(null)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  doStartLive(colorConflictModal.matchId); // Start without bibs
                  setColorConflictModal(null);
                }}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Ignora
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 text-white py-2.5 px-4 text-center z-50 text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-2xl">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          <span>MODALITÀ OPERATORE ATTIVA · Puoi modificare i punteggi, gli stati dei match e risolvere le parità.</span>
        </div>
      )}
    </div>
  );
}

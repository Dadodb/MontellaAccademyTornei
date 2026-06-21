import React, { useState } from 'react';
import type { Category, Team, Field, Match, TeamColor } from '../types';
import { TEAM_COLORS, getTeamColorClasses } from '../utils/teamColors';
import { Plus, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  categories: Category[];
  teams: Team[];
  fields: Field[];
  matches: Match[];
  onAddCategory: (name: string, groupsCount: number) => Promise<void>;
  onUpdateCategory: (id: string, name: string, groupsCount: number) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddField: (name: string) => Promise<void>;
  onUpdateField: (id: string, name: string) => Promise<void>;
  onDeleteField: (id: string) => Promise<void>;
  onAddTeam: (name: string, categoryId: string, groupName: string, primaryColor: TeamColor) => Promise<void>;
  onUpdateTeam: (id: string, name: string, categoryId: string, groupName: string, primaryColor: TeamColor) => Promise<void>;
  onDeleteTeam: (id: string) => Promise<void>;
  onGenerateCalendar: (startTime: string, matchDuration: number, breakDuration: number, generatePlayoffs: boolean) => Promise<void>;
  onDeleteAllMatches: () => Promise<void>;
  onDeleteAllTeams: () => Promise<void>;
  onDeleteAllFields: () => Promise<void>;
  onDeleteAllCategories: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  teams,
  fields,
  matches,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddField,
  onUpdateField,
  onDeleteField,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onGenerateCalendar,
  onDeleteAllMatches,
  onDeleteAllTeams,
  onDeleteAllFields,
  onDeleteAllCategories,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroups, setNewCategoryGroups] = useState(1);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryGroups, setEditingCategoryGroups] = useState(1);

  // Field State
  const [newFieldName, setNewFieldName] = useState('');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState('');

  // Team State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCategoryId, setNewTeamCategoryId] = useState('');
  const [newTeamGroupName, setNewTeamGroupName] = useState('A');
  const [newTeamColor, setNewTeamColor] = useState<TeamColor>('white');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [editingTeamCategoryId, setEditingTeamCategoryId] = useState('');
  const [editingTeamGroupName, setEditingTeamGroupName] = useState('A');
  const [editingTeamColor, setEditingTeamColor] = useState<TeamColor>('white');

  // Calendar Gen State
  const [genStartTime, setGenStartTime] = useState('15:00');
  const [genMatchDuration, setGenMatchDuration] = useState(20);
  const [genBreakDuration, setGenBreakDuration] = useState(10);
  const [genPlayoffs, setGenPlayoffs] = useState(true);

  // --- Handlers for Categories ---
  const handleAddCategoryClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setError(null);
      await onAddCategory(newCategoryName.trim(), newCategoryGroups);
      setNewCategoryName('');
      setNewCategoryGroups(1);
    } catch (err: any) {
      setError(err.message || 'Errore creazione categoria');
    }
  };

  const handleUpdateCategoryClick = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    try {
      setError(null);
      await onUpdateCategory(editingCategoryId, editingCategoryName.trim(), editingCategoryGroups);
      setEditingCategoryId(null);
    } catch (err: any) {
      setError(err.message || "Errore aggiornamento categoria");
    }
  };

  const handleDeleteCategoryClick = async (id: string) => {
    const hasTeams = teams.some(t => t.category_id === id);
    if (hasTeams) {
      setError("Impossibile eliminare: ci sono squadre in questa categoria.");
      return;
    }
    const hasMatches = matches.some(m => m.category_id === id);
    if (hasMatches) {
        setError("Impossibile eliminare: ci sono partite per questa categoria.");
        return;
    }
    
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      try {
        setError(null);
        await onDeleteCategory(id);
      } catch (err: any) {
        setError(err.message || "Errore eliminazione categoria");
      }
    }
  };

  // --- Handlers for Fields ---
  const handleAddFieldClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    try {
      setError(null);
      await onAddField(newFieldName.trim());
      setNewFieldName('');
    } catch (err: any) {
      setError(err.message || 'Errore creazione campo');
    }
  };

  const handleUpdateFieldClick = async () => {
    if (!editingFieldId || !editingFieldName.trim()) return;
    try {
      setError(null);
      await onUpdateField(editingFieldId, editingFieldName.trim());
      setEditingFieldId(null);
    } catch (err: any) {
      setError(err.message || "Errore aggiornamento campo");
    }
  };

  const handleDeleteFieldClick = async (id: string) => {
    const hasMatches = matches.some(m => m.field_id === id);
    if (hasMatches) {
      setError("Impossibile eliminare: ci sono partite programmate su questo campo.");
      return;
    }
    
    if (confirm('Sei sicuro di voler eliminare questo campo?')) {
      try {
        setError(null);
        await onDeleteField(id);
      } catch (err: any) {
        setError(err.message || "Errore eliminazione campo");
      }
    }
  };

  // --- Handlers for Teams ---
  const handleAddTeamClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || (!newTeamCategoryId && categories.length === 0)) return;
    
    const categoryId = newTeamCategoryId || categories[0].id;
    try {
      setError(null);
      await onAddTeam(newTeamName.trim(), categoryId, newTeamGroupName, newTeamColor);
      setNewTeamName('');
    } catch (err: any) {
      setError(err.message || "Errore aggiunta squadra");
    }
  };

  const handleUpdateTeamClick = async () => {
    if (!editingTeamId || !editingTeamName.trim() || !editingTeamCategoryId) return;
    try {
      setError(null);
      await onUpdateTeam(editingTeamId, editingTeamName.trim(), editingTeamCategoryId, editingTeamGroupName, editingTeamColor);
      setEditingTeamId(null);
    } catch (err: any) {
      setError(err.message || "Errore aggiornamento squadra");
    }
  };

  const handleDeleteTeamClick = async (id: string) => {
    const hasMatches = matches.some(m => m.team_home_id === id || m.team_away_id === id);
    if (hasMatches) {
      setError("Impossibile eliminare: questa squadra ha partite in programma.");
      return;
    }
    
    if (confirm('Sei sicuro di voler eliminare questa squadra?')) {
      try {
        setError(null);
        await onDeleteTeam(id);
      } catch (err: any) {
        setError(err.message || "Errore eliminazione squadra");
      }
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-10">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pannello di Gestione
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestisci categorie, campi e squadre del torneo.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 flex items-center gap-2 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categorie Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Categorie ({categories.length})
          </h3>
        </div>

        <form onSubmit={handleAddCategoryClick} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nuova categoria..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <div className="flex flex-col w-20">
            <label className="text-[10px] text-slate-500 mb-0.5">Gironi</label>
            <input
              type="number"
              min="1"
              max="8"
              value={newCategoryGroups}
              onChange={(e) => setNewCategoryGroups(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-center focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Aggiungi
          </button>
        </form>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">Nessuna categoria.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                {editingCategoryId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      autoFocus
                    />
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={editingCategoryGroups}
                      onChange={(e) => setEditingCategoryGroups(parseInt(e.target.value) || 1)}
                      className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-center dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button onClick={handleUpdateCategoryClick} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingCategoryId(null)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                      <span className="text-[10px] text-slate-400">{cat.groups_count > 1 ? `${cat.groups_count} Gironi` : 'Girone Unico'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryGroups(cat.groups_count || 1); }} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteCategoryClick(cat.id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Campi Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Campi ({fields.length})
          </h3>
        </div>

        <form onSubmit={handleAddFieldClick} className="flex gap-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Nuovo campo..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newFieldName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Aggiungi
          </button>
        </form>

        <div className="space-y-2">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">Nessun campo.</p>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                {editingFieldId === field.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editingFieldName}
                      onChange={(e) => setEditingFieldName(e.target.value)}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      autoFocus
                    />
                    <button onClick={handleUpdateFieldClick} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingFieldId(null)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{field.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingFieldId(field.id); setEditingFieldName(field.name); }} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteFieldClick(field.id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Squadre Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Squadre ({teams.length})
          </h3>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Aggiungi almeno una categoria prima di inserire le squadre.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Category Tabs per le Squadre */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 snap-x hide-scrollbar">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setNewTeamCategoryId(cat.id);
                      setNewTeamGroupName('A');
                      setNewTeamName('');
                      setEditingTeamId(null);
                    }}
                    className={`snap-start whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      newTeamCategoryId === cat.id || (!newTeamCategoryId && categories[0].id === cat.id)
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name} ({teams.filter((t) => t.category_id === cat.id).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Form Aggiunta Squadra per la Categoria Selezionata */}
            {(() => {
              const activeCatId = newTeamCategoryId || categories[0].id;
              const activeCat = categories.find((c) => c.id === activeCatId);
              const activeCatName = activeCat?.name;
              const teamsInCat = teams.filter((t) => t.category_id === activeCatId);
              
              // Generate group options A, B, C...
              const groupsCount = activeCat?.groups_count || 1;
              const groupOptions = Array.from({ length: groupsCount }, (_, i) => String.fromCharCode(65 + i));

              return (
                <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newTeamName.trim()) return;
                      handleAddTeamClick({ preventDefault: () => {} } as any);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => {
                        setNewTeamName(e.target.value);
                        if (!newTeamCategoryId) setNewTeamCategoryId(activeCatId);
                      }}
                      placeholder={`Nuova squadra in ${activeCatName}...`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    {groupsCount > 1 && (
                      <select
                        value={newTeamGroupName}
                        onChange={(e) => setNewTeamGroupName(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {groupOptions.map(g => <option key={g} value={g}>Gir. {g}</option>)}
                      </select>
                    )}
                    <select
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value as TeamColor)}
                      className="w-10 sm:w-auto rounded-lg border border-slate-300 bg-white px-1 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      title="Colore Maglia"
                    >
                      {Object.entries(TEAM_COLORS).map(([colorKey, colorData]) => (
                        <option key={colorKey} value={colorKey}>
                          {colorData.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!newTeamName.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Aggiungi
                    </button>
                  </form>

                  {/* Lista Squadre della Categoria Selezionata */}
                  <div className="space-y-2">
                    {teamsInCat.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">
                        Nessuna squadra in {activeCatName}.
                      </p>
                    ) : (
                      teamsInCat.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          {editingTeamId === team.id ? (
                            <div className="flex flex-col w-full gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTeamName}
                                  onChange={(e) => setEditingTeamName(e.target.value)}
                                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={handleUpdateTeamClick}
                                  className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingTeamId(null)}
                                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <select
                                value={editingTeamCategoryId}
                                onChange={(e) => setEditingTeamCategoryId(e.target.value)}
                                className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editingTeamGroupName}
                                onChange={(e) => setEditingTeamGroupName(e.target.value)}
                                className="w-16 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {Array.from({ length: categories.find(c => c.id === editingTeamCategoryId)?.groups_count || 1 }, (_, i) => String.fromCharCode(65 + i)).map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                              <select
                                value={editingTeamColor}
                                onChange={(e) => setEditingTeamColor(e.target.value as TeamColor)}
                                className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                title="Colore Maglia"
                              >
                                {Object.entries(TEAM_COLORS).map(([colorKey, colorData]) => (
                                  <option key={colorKey} value={colorKey}>
                                    {colorData.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full border ${getTeamColorClasses(team.primary_color).bg} ${getTeamColorClasses(team.primary_color).border}`} title={`Maglia: ${getTeamColorClasses(team.primary_color).label}`} />
                                  <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {team.name}
                                  </span>
                                </div>
                                {(categories.find(c => c.id === team.category_id)?.groups_count || 1) > 1 && (
                                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-5">
                                    Girone {team.group_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingTeamId(team.id);
                                    setEditingTeamName(team.name);
                                    setEditingTeamCategoryId(team.category_id);
                                    setEditingTeamGroupName(team.group_name || 'A');
                                    setEditingTeamColor(team.primary_color);
                                  }}
                                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeamClick(team.id)}
                                  className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* Generazione Calendario Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Generazione Calendario
          </h3>
        </div>
        
        <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          <p className="text-xs text-slate-500">
            Genera automaticamente il girone all'italiana (Tutti contro Tutti) e i playoff per <strong>TUTTE le categorie</strong> in contemporanea, ottimizzando l'uso dei campi.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] text-slate-500 mb-0.5">Orario Inizio</label>
              <input
                type="time"
                value={genStartTime}
                onChange={(e) => setGenStartTime(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] text-slate-500 mb-0.5">Durata Partita (min)</label>
              <input
                type="number"
                min="5"
                value={genMatchDuration}
                onChange={(e) => setGenMatchDuration(parseInt(e.target.value) || 20)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-slate-500 mb-0.5">Pausa tra partite (min)</label>
              <input
                type="number"
                min="0"
                value={genBreakDuration}
                onChange={(e) => setGenBreakDuration(parseInt(e.target.value) || 0)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 mt-4 col-span-2">
              <input
                type="checkbox"
                id="genPlayoffs"
                checked={genPlayoffs}
                onChange={(e) => setGenPlayoffs(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="genPlayoffs" className="text-xs text-slate-600 dark:text-slate-400">
                Includi Partite Segnaposto per Fasi Finali
              </label>
            </div>
          </div>
          
          <button
            onClick={async () => {
              if (categories.length === 0 || teams.length === 0) { setError("Aggiungi categorie e squadre prima di generare"); return; }
              try {
                setError(null);
                await onGenerateCalendar(genStartTime, genMatchDuration, genBreakDuration, genPlayoffs);
                alert("Calendario Globale generato con successo!");
              } catch (err: any) {
                setError(err.message || 'Errore durante la generazione');
              }
            }}
            className="w-full mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Genera Calendario Globale
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-8 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-200 pb-2 dark:border-rose-900/50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Azioni Massive
          </h3>
        </div>

        {/* Contextual action cards — shown based on current data state */}
        <div className="space-y-3">

          {/* ── STEP 1: Calendar exists → show only "Svuota Calendario" ── */}
          {matches.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Svuota Calendario</h4>
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-500">
                  Elimina tutte le partite ({matches.length} partite). Mantiene squadre, campi e categorie per generare un nuovo calendario.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(`Eliminare TUTTE le ${matches.length} partite dal calendario?`)) {
                    try { await onDeleteAllMatches(); } catch(e:any) { setError(e.message); }
                  }
                }}
                className="self-start rounded-lg border border-rose-600 bg-transparent px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
              >
                Elimina tutte le Partite
              </button>
            </div>
          )}

          {/* ── STEP 2: No calendar → show data cleanup actions in correct dependency order ── */}
          {matches.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Elimina Squadre — available if teams exist */}
              {teams.length > 0 ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Elimina Squadre</h4>
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-500">
                      Elimina tutte le {teams.length} squadre registrate.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Eliminare TUTTE le ${teams.length} squadre?`)) {
                        try { await onDeleteAllTeams(); } catch(e:any) { setError(e.message); }
                      }
                    }}
                    className="self-start rounded-lg border border-rose-600 bg-transparent px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
                  >
                    Elimina tutte le Squadre
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500">Elimina Squadre</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-600">Nessuna squadra da eliminare.</p>
                </div>
              )}

              {/* Elimina Campi — available if fields exist AND no teams (teams reference fields via matches) */}
              {fields.length > 0 && teams.length === 0 ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Elimina Campi</h4>
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-500">
                      Elimina tutti i {fields.length} campi di gioco.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Eliminare TUTTI i ${fields.length} campi?`)) {
                        try { await onDeleteAllFields(); } catch(e:any) { setError(e.message); }
                      }
                    }}
                    className="self-start rounded-lg border border-rose-600 bg-transparent px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
                  >
                    Elimina tutti i Campi
                  </button>
                </div>
              ) : fields.length > 0 && teams.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500">Elimina Campi</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-600">Elimina prima le squadre per poter rimuovere i campi.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500">Elimina Campi</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-600">Nessun campo da eliminare.</p>
                </div>
              )}

              {/* Elimina Categorie — available only when teams are also gone */}
              {categories.length > 0 && teams.length === 0 ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3 sm:col-span-2">
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Elimina Categorie</h4>
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-500">
                      Elimina tutte le {categories.length} categorie del torneo.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Eliminare TUTTE le ${categories.length} categorie?`)) {
                        try { await onDeleteAllCategories(); } catch(e:any) { setError(e.message); }
                      }
                    }}
                    className="self-start rounded-lg border border-rose-600 bg-transparent px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
                  >
                    Elimina tutte le Categorie
                  </button>
                </div>
              ) : categories.length > 0 && teams.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col gap-1 sm:col-span-2">
                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500">Elimina Categorie</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-600">Elimina prima le squadre per poter rimuovere le categorie.</p>
                </div>
              ) : null}

            </div>
          )}

          {/* Everything is clean */}
          {matches.length === 0 && teams.length === 0 && fields.length === 0 && categories.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/30 text-center">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Nessun dato da eliminare.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">Il torneo è completamente resettato.</p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

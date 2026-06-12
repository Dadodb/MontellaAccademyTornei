const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('  const handleGenerateCalendar = async (\n');
const endIndex = content.indexOf('  const handleDeleteAllMatches = async () => {\n');

if (startIndex === -1 || endIndex === -1) {
    console.error('Cannot find boundaries', { startIndex, endIndex });
    process.exit(1);
}

const replacement = `  const handleGenerateCalendar = async (
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
              homePlaceholder: \`1° Girone \${groupKeys[0]}\`,
              awayPlaceholder: \`2° Girone \${groupKeys[1]}\`
            });
            semiFinalsToSchedule.push({
              category: cat.id,
              homePlaceholder: \`1° Girone \${groupKeys[1]}\`,
              awayPlaceholder: \`2° Girone \${groupKeys[0]}\`
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
`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(file, newContent);
console.log('Successfully updated App.tsx');

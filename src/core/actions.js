(function() {
    window.adTourney = window.adTourney || {}; //

    window.adTourney.actions = {
        updateGlobalSetting: function(key, value) {
            window.adTourney.state.settings[key] = value;
            window.adTourney.save();
            window.adTourney.renderUI();
        }, //

        toggleSettingsPopup: function() {
            window.adTourney.state.showSettings = !window.adTourney.state.showSettings;
            window.adTourney.save();
            window.adTourney.renderUI();
        }, //

        resetTournament: function() {
            const { state, save, renderUI } = window.adTourney; //
            window.adModals.show({ 
                title: 'TURNIER LÖSCHEN?', text: 'Möchtest du das aktuelle Turnier beenden? Spieler und Einstellungen bleiben gespeichert.', confirmText: 'Turnier beenden', onConfirm: () => {
                    state.step = 'SETUP'; state.view = 'KO'; state.activePlayer1Name = null;
                    state.surrenderedPlayers = []; state.matches = [];
                    state.groupMatches = []; state.leagueMatches = []; state.groups = []; state.rounds = []; state.reachable = [];
                    state.showSettings = false;
                    save(); renderUI();
                }
            }); //
        },

        // Neue Funktion zum kompletten Zurücksetzen von Namen und Settings
        fullReset: function() {
            const { state, save, renderUI } = window.adTourney;
            window.adModals.show({ 
                title: 'ALLES ZURÜCKSETZEN?', text: 'Dies löscht alle eingetragenen Namen und setzt alle Match-Optionen auf Standardwerte.', confirmText: 'Alles löschen', onConfirm: () => {
                    const defaults = {
                        step: 'SETUP', mode: 'KO', view: 'KO', activePlayer1Name: null,
                        groupSettings: { size: 4, totalAdvance: 8 },
                        players: [], surrenderedPlayers: [], matches: [],
                        groupMatches: [], leagueMatches: [], groups: [], rounds: [], reachable: [],
                        showSettings: false,
                        settings: { baseScore: 501, inMode: "Straight", outMode: "Double", maxRounds: 50, bullMode: "25/50", bullOffMode: "Normal", targetLegs: 2 }
                    };
                    Object.assign(state, defaults);
                    save(); renderUI();
                }
            });
        },

        surrenderGlobally: function(playerName) {
            const { state, save, renderUI, updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory } = window.adTourney; //
            window.adModals.show({ 
                title: 'KOMPLETTE AUFGABE', text: `${playerName} gibt das gesamte Turnier auf?`, confirmText: 'Ja, aufgeben', onConfirm: () => {
                    if (!state.surrenderedPlayers.includes(playerName)) state.surrenderedPlayers.push(playerName);
                    [state.groupMatches, state.matches, state.leagueMatches].forEach(list => {
                        list.forEach((m, idx) => {
                            if ((m.p1 === playerName || m.p2 === playerName) && !m.finished) {
                                m.winner = (m.p1 === playerName) ? m.p2 : m.p1; m.finished = true; m.results = { p1L: '0', p1A: '-', p2L: '0', p2A: '-' };
                                if (list !== state.matches) updateTable(m, state.groups);
                                else { advanceWinner(idx); checkFinalVictory(idx); }
                            }
                        });
                    });
                    state.activePlayer1Name = null;
                    if (state.mode === 'LEAGUE') checkLeagueVictory();
                    save(); renderUI();
                }
            }); //
        },

        startTournament: function() {
            const { state, save, renderUI, createKOBracket } = window.adTourney; //
            if (state.players.length < 2) return;
            const shuffled = [...state.players].sort(() => Math.random() - 0.5);
            
            if (state.mode === 'GROUPS') {
                const targetSize = state.groupSettings.size;
                const numGroups = Math.ceil(shuffled.length / targetSize);
                const baseSize = Math.floor(shuffled.length / numGroups);
                const extraPlayers = shuffled.length % numGroups;
                let currentIdx = 0; let groups = []; let groupMatches = [];
                for (let i = 0; i < numGroups; i++) {
                    const groupSize = i < extraPlayers ? baseSize + 1 : baseSize;
                    const groupPlayers = shuffled.slice(currentIdx, currentIdx + groupSize);
                    currentIdx += groupSize;
                    const gId = String.fromCharCode(65 + i);
                    groups.push({ id: gId, players: groupPlayers.map(p => ({ name: p, wins: 0, diff: 0, lf: 0, la: 0, totalAvg: 0, sumAvg: 0, playedAvgMatches: 0 })) });
                    for (let j = 0; j < groupPlayers.length; j++) { for (let k = j + 1; k < groupPlayers.length; k++) { groupMatches.push({ groupId: gId, p1: groupPlayers[j], p2: groupPlayers[k], finished: false, results: null, winner: null, uuid: null }); } }
                }
                state.groups = groups; state.groupMatches = groupMatches; state.step = 'ACTIVE_GROUPS'; state.view = 'GROUPS';
            } else if (state.mode === 'LEAGUE') {
                let leagueMatches = [];
                state.groups = [{ id: 'LIGA', players: shuffled.map(p => ({ name: p, wins: 0, diff: 0, lf: 0, la: 0, totalAvg: 0, sumAvg: 0, playedAvgMatches: 0 })) }];
                for (let j = 0; j < shuffled.length; j++) { for (let k = j + 1; k < shuffled.length; k++) { leagueMatches.push({ p1: shuffled[j], p2: shuffled[k], finished: false, results: null, winner: null, uuid: null }); } }
                state.leagueMatches = leagueMatches; state.step = 'ACTIVE_LEAGUE'; state.view = 'LEAGUE';
            } else { 
                createKOBracket(shuffled); state.step = 'ACTIVE'; state.view = 'KO'; 
            }
            save(); renderUI();
        } //
    }; //
})(); //
(function() {
    window.adTourney = window.adTourney || {}; //

    let isSyncing = false; //

    const getAuthToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; Authorization=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; //
    };

    window.adTourney.syncMatchResults = async function() {
        if (isSyncing) return; //
        isSyncing = true; //

        const { state, save, renderUI, updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory } = window.adTourney; //
        if (!state) { isSyncing = false; return; } //

        const token = getAuthToken(); //
        if (!token) {
            console.warn("⚠️ [AD-Sync] Kein Auth-Token gefunden. Bitte stelle sicher, dass du eingeloggt bist.");
            isSyncing = false;
            return; //
        }

        const isLeague = state.mode === 'LEAGUE'; //
        const list = isLeague ? state.leagueMatches : (state.view === 'GROUPS' ? state.groupMatches : state.matches); //
        
        // WICHTIG: Wir filtern nur Matches, die eine UUID haben, aber noch nicht 'finished' sind.
        // Die UUID bleibt im Speicher erhalten, solange m.finished false ist.
        const pending = list.filter(m => m && m.uuid && !m.finished); //

        if (pending.length === 0) {
            isSyncing = false;
            return; //
        }

        try {
            let hasChanges = false;

            // Parallele Abfrage aller offenen Matches
            await Promise.all(pending.map(async (m) => {
                try {
                    const response = await fetch(`https://api.autodarts.io/as/v0/matches/${m.uuid}/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }); //

                    if (response.ok) {
                        const data = await response.json(); //
                        
                        // Prüfen, ob das Match im Archiv einen gültigen Gewinner (Index 0 oder 1) hat
                        if (data.winner !== undefined && data.winner !== -1) {
                            const winnerIdx = data.winner; //
                            const p1Stats = data.matchStats[0]; //
                            const p2Stats = data.matchStats[1]; //

                            m.results = {
                                p1L: String(p1Stats.legsWon || 0),
                                p1A: (p1Stats.average || 0).toFixed(2),
                                p2L: String(p2Stats.legsWon || 0),
                                p2A: (p2Stats.average || 0).toFixed(2)
                            }; //

                            m.winner = data.players[winnerIdx].name; //
                            m.finished = true; //
                            hasChanges = true;

                            const mIdx = list.indexOf(m); //

                            // Turnier-Logik aktualisieren
                            if (state.mode === 'LEAGUE' || state.view === 'GROUPS') {
                                updateTable(m, state.groups); //
                            } else {
                                advanceWinner(mIdx); //
                                checkFinalVictory(mIdx); //
                            }

                            if (isLeague) checkLeagueVictory(); //
                            console.log(`✅ [AD-Sync] Match ${m.uuid} wurde erfolgreich synchronisiert.`); //
                        } else {
                            // Match läuft noch oder Archiv-Daten sind noch nicht bereit
                            console.log(`⏳ [AD-Sync] Match ${m.uuid} ist noch aktiv oder wird verarbeitet.`);
                        }
                    } else if (response.status === 404) {
                        console.warn(`⚠️ [AD-Sync] Match ${m.uuid} konnte nicht im Archiv gefunden werden.`);
                    }
                } catch (e) {
                    console.error(`❌ [AD-Sync] Fehler bei Match ${m.uuid}:`, e); //
                }
            }));

            // Nur speichern und rendern, wenn tatsächlich ein Ergebnis gefunden wurde
            if (hasChanges) {
                save(); //
                renderUI(); //
            }

        } catch (globalErr) {
            console.error("❌ [AD-Sync] Globaler Synchronisierungsfehler:", globalErr); //
        } finally {
            isSyncing = false; //
        }
    };
})();
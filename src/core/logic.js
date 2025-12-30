(function() {
    window.adTourney = window.adTourney || {};

    /**
     * Aktualisiert die Tabellen-Statistiken basierend auf einem Match-Ergebnis
     */
    window.adTourney.updateTable = function(m, source) {
        const g = m.groupId ? source.find(x => x.id === m.groupId) : source[0]; if(!g) return;
        const p1 = g.players.find(x => x.name === m.p1); const p2 = g.players.find(x => x.name === m.p2);
        if (m.winner === p1.name) p1.wins++; else p2.wins++;
        const l1 = parseInt(m.results.p1L) || 0; const l2 = parseInt(m.results.p2L) || 0;
        p1.lf += l1; p1.la += l2; p1.diff = p1.lf - p1.la;
        p2.lf += l2; p2.la += l1; p2.diff = p2.lf - p2.la;
        [p1, p2].forEach(p => { if (p.sumAvg === undefined) { p.sumAvg = 0; p.playedAvgMatches = 0; p.totalAvg = 0; } });
        const a1 = parseFloat(m.results.p1A) || 0; const a2 = parseFloat(m.results.p2A) || 0;
        if (a1 > 0) { p1.sumAvg += a1; p1.playedAvgMatches++; p1.totalAvg = p1.sumAvg / p1.playedAvgMatches; }
        if (a2 > 0) { p2.sumAvg += a2; p2.playedAvgMatches++; p2.totalAvg = p2.sumAvg / p2.playedAvgMatches; }
    };

    /**
     * Schiebt den Gewinner eines KO-Matches in den nächsten Slot
     */
    window.adTourney.advanceWinner = function(idx) {
        const { state } = window.adTourney;
        const m = state.matches[idx];
        if (m && m.nextMatchIdx !== null && state.matches[m.nextMatchIdx]) {
            const n = state.matches[m.nextMatchIdx];
            if (m.nextMatchSlot === 1) n.p1 = m.winner; else n.p2 = m.winner;
        }
    };

    /**
     * Prüft, ob das Finale beendet wurde
     */
    window.adTourney.checkFinalVictory = function(matchIdx) {
        const { state } = window.adTourney;
        if (matchIdx === state.matches.length - 1) {
            const finalMatch = state.matches[matchIdx];
            if (finalMatch.finished && finalMatch.winner) {
                setTimeout(() => { window.adModals.show({ title: '🏆 SIEGER!', text: `${finalMatch.winner} hat gewonnen!`, confirmText: 'Super!', isSuccess: true }); }, 500);
            }
        }
    };

    /**
     * Prüft, ob alle Ligaspiele absolviert wurden
     */
    window.adTourney.checkLeagueVictory = function() {
        const { state } = window.adTourney;
        if (state.leagueMatches.length > 0 && state.leagueMatches.every(m => m.finished)) {
            const sorted = [...state.groups[0].players].sort((a,b) => b.wins - a.wins || b.diff - a.diff || (b.totalAvg || 0) - (a.totalAvg || 0));
            setTimeout(() => { window.adModals.show({ title: '🏆 LIGASIEGER!', text: `${sorted[0].name} hat die Liga gewonnen!`, confirmText: 'Super!', isSuccess: true }); }, 500);
        }
    };

    /**
     * Erstellt das initiale KO-System
     */
    window.adTourney.createKOBracket = function(players) {
        const { state } = window.adTourney;
        const powerOf2 = Math.pow(2, Math.ceil(Math.log2(players.length)));
        const numRounds = Math.log2(powerOf2);
        let matches = []; let roundInfo = []; let matchCounter = 0;
        for (let r = 0; r < numRounds; r++) {
            let count = powerOf2 / Math.pow(2, r + 1);
            let start = matchCounter;
            for (let i = 0; i < count; i++) {
                matches.push({ id: matchCounter++, p1: 'TBD', p2: 'TBD', finished: false, uuid: null, results: null, winner: null, nextMatchIdx: null, nextMatchSlot: (i % 2 === 0 ? 1 : 2) });
            }
            roundInfo.push({ round: r, start, count });
        }
        for (let r = 0; r < numRounds - 1; r++) {
            for (let i = 0; i < roundInfo[r].count; i++) {
                matches[roundInfo[r].start + i].nextMatchIdx = roundInfo[r+1].start + Math.floor(i / 2);
            }
        }
        const numR1 = players.length - (powerOf2 / 2);
        let pIdx = 0; let r1Occ = new Set(); 
        for (let i = 0; i < numR1; i++) {
            matches[i].p1 = players[pIdx++]; matches[i].p2 = players[pIdx++];
            r1Occ.add(`${matches[i].nextMatchIdx}-${matches[i].nextMatchSlot}`);
        }
        for (let i = roundInfo[0].count; i < matches.length; i++) {
            if (pIdx < players.length) {
                if (!r1Occ.has(`${i}-1`) && matches[i].p1 === 'TBD') matches[i].p1 = players[pIdx++];
                if (pIdx < players.length && !r1Occ.has(`${i}-2`) && matches[i].p2 === 'TBD') matches[i].p2 = players[pIdx++];
            }
        }
        state.matches = matches; state.rounds = roundInfo; window.adTourney.recalculateReachable();
    };

    /**
     * Berechnet, welche Matches im KO-Baum erreichbar sind
     */
    window.adTourney.recalculateReachable = function() {
        const { state } = window.adTourney;
        const reachable = new Set();
        state.matches.forEach((m, idx) => { if (m.p1 !== 'TBD' || m.p2 !== 'TBD') reachable.add(idx); });
        for (let i = 0; i < state.matches.length; i++) {
            if (reachable.has(i) && state.matches[i].nextMatchIdx !== null) reachable.add(state.matches[i].nextMatchIdx);
        }
        state.reachable = Array.from(reachable);
    };

    /**
     * Ermittelt die Spieler, die sich für die KO-Phase qualifiziert haben
     */
    window.adTourney.getCurrentlyAdvancing = function() {
        const { state } = window.adTourney;
        let allRanked = [];
        state.groups.forEach(g => {
            const sorted = [...g.players].sort((a,b) => {
                const isSurrA = state.surrenderedPlayers.includes(a.name); const isSurrB = state.surrenderedPlayers.includes(b.name);
                if (isSurrA && !isSurrB) return 1; if (!isSurrA && isSurrB) return -1;
                return b.wins - a.wins || b.diff - a.diff || (b.totalAvg || 0) - (a.totalAvg || 0);
            });
            sorted.forEach((p, idx) => { allRanked.push({ ...p, rank: idx + 1 }); });
        });
        allRanked.sort((a, b) => {
            const isSurrA = state.surrenderedPlayers.includes(a.name); const isSurrB = state.surrenderedPlayers.includes(b.name);
            if (isSurrA && !isSurrB) return 1; if (!isSurrA && isSurrB) return -1;
            return a.rank - b.rank || b.wins - a.wins || b.diff - a.diff || (b.totalAvg || 0) - (a.totalAvg || 0);
        });
        return allRanked.filter(p => !state.surrenderedPlayers.includes(p.name)).slice(0, state.groupSettings.totalAdvance).map(p => p.name);
    };
})();
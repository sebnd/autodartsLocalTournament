(function() {
    // Matchbox-spezifische Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .match-box { position: relative; border: 1px solid #2D3748; padding: 5px 12px; border-radius: 8px; background: #2D3748; width: 300px; height: 60px; z-index: 10; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px !important; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .match-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        .player-row { display: flex; align-items: center; width: 100%; font-size: 15px; line-height: 1.4; }
        .player-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; color: white; text-transform: uppercase; flex-shrink: 0; padding-right: 6px; }
        .player-tbd { color: #718096 !important; font-style: italic !important; }
        .stats-avg { font-weight: 400; color: #A0AEC0; margin-left: auto; padding-right: 12px; white-space: nowrap; font-size: 13px; text-align: right; }
        .stats-legs { font-weight: 400; color: white; min-width: 25px; text-align: right; font-size: 14px; flex-shrink: 0; }
        .winner-text .player-name { color: #48BB78 !important; }
        .surrender-btn { background: transparent; border: none; color: rgba(255,255,255,0.2); cursor: pointer; margin-left: 10px; }
        .play-btn-round { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; margin-left: 12px; transition: 0.2s; }
        .btn-green { background: #38A169 !important; }
        .btn-red { background: #E53E3E !important; }
    `;
    document.head.appendChild(style);

    window.adMatchbox = {
        render: function(m, idx, type) {
            const state = window.adTourney.state; //
            
            // Prüfen ob aktuell IRGENDEIN Match aktiv ist (UUID vorhanden und nicht finished)
            const anyActive = [
                ...(state.matches || []), 
                ...(state.groupMatches || []), 
                ...(state.leagueMatches || [])
            ].some(match => match && match.uuid && !match.finished); //

            const isStarted = m.uuid && !m.finished; //

            // Play-Button anzeigen wenn: 
            // 1. Spieler feststehen und Match nicht beendet ist
            // 2. UND (entweder kein Match aktiv ist ODER genau dieses Match das aktive ist)
            const canStart = !m.finished && m.p1 !== 'TBD' && m.p2 !== 'TBD' && (!anyActive || isStarted); //

            return `
                <div class="match-box">
                    <div class="match-content">
                        <div class="player-row ${m.winner === m.p1 ? 'winner-text' : ''}">
                            <span class="player-name ${m.p1 === 'TBD' ? 'player-tbd' : ''}">${m.p1}</span>
                            ${canStart ? `<button class="surrender-btn" data-m="${idx}" data-p="1">🏳</button>` : ''}
                            <span class="stats-avg">${m.results ? m.results.p1A : ''}</span>
                            <span class="stats-legs">${m.results ? m.results.p1L : ''}</span>
                        </div>
                        <div class="player-row ${m.winner === m.p2 ? 'winner-text' : ''}">
                            <span class="player-name ${m.p2 === 'TBD' ? 'player-tbd' : ''}">${m.p2}</span>
                            ${canStart ? `<button class="surrender-btn" data-m="${idx}" data-p="2">🏳</button>` : ''}
                            <span class="stats-avg">${m.results ? m.results.p2A : ''}</span>
                            <span class="stats-legs">${m.results ? m.results.p2L : ''}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        ${isStarted ? `<button class="reset-match" data-type="${type}" data-idx="${idx}" style="background:transparent; border:none; color:#A0AEC0; cursor:pointer; margin-right:8px; font-size:16px;">↺</button>` : ''}
                        ${canStart ? `<button class="play-match play-btn-round ${isStarted ? 'btn-red' : 'btn-green'}" data-type="${type}" data-idx="${idx}">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </button>` : ''}
                    </div>
                </div>`;
        }
    };
})();
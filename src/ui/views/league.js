(function() {
    // Styles für den Liga-Bildschirm (Spielplan-Header)
    const style = document.createElement('style');
    style.innerHTML = `
        .ad-league-match-header { color: #3182CE; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
        .ad-league-match-container { display: flex; flex-wrap: wrap; gap: 15px; }
        .ad-league-section { margin-bottom: 30px; }
    `;
    document.head.appendChild(style);

    window.adLeague = {
        render: function(state, containerWidth, getCurrentlyAdvancing) {
            let html = "";
            
            // 1. Tabellen-Grid rendern (via tables.js)
            html += window.adTables.renderStandingGrid(
                state.groups, 
                'LEAGUE', 
                state.surrenderedPlayers, 
                getCurrentlyAdvancing(), 
                containerWidth
            );

            // 2. Liga-Spielplan rendern
            const activeMatches = state.leagueMatches;
            state.groups.forEach(g => {
                const mList = activeMatches.filter(m => !m.groupId || m.groupId === g.id).sort((a, b) => a.finished - b.finished);
                html += `
                    <div class="ad-league-section">
                        <div class="ad-league-match-header">SPIELPLAN LIGA</div>
                        <div class="ad-league-match-container">
                            ${mList.map(m => window.adMatchbox.render(m, activeMatches.indexOf(m), 'league')).join('')}
                        </div>
                    </div>`;
            });

            return html;
        }
    };
})();
(function() {
    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': { startKo: 'KO-Phase starten', schedule: 'SPIELPLAN GRUPPE' },
        'en': { startKo: 'START KO-PHASE', schedule: 'GROUP SCHEDULE' }
    };
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    // Styles für Gruppen-spezifische Elemente
    const style = document.createElement('style');
    style.innerHTML = `
        .ad-group-section { margin-bottom: 30px; }
        .ad-group-match-header { color: #3182CE; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
        .ad-group-match-container { display: flex; flex-wrap: wrap; gap: 15px; }
    `;
    document.head.appendChild(style);

    window.adGroups = {
        render: function(state, containerWidth, getCurrentlyAdvancing) {
            let html = "";
            
            // 1. Tabellen-Grid rendern (via tables.js)
            html += window.adTables.renderStandingGrid(
                state.groups, 
                'GROUPS', 
                state.surrenderedPlayers, 
                getCurrentlyAdvancing(), 
                containerWidth
            );

            const activeMatches = state.groupMatches;
            const allDone = activeMatches.every(m => m.finished);

            // 2. Button für KO-Phase starten (Inline-Style wie im Original beibehalten)
            if (state.step === 'ACTIVE_GROUPS' && allDone) {
                html += `<button id="start-ko-final" style="width:100%; max-width:400px; margin:20px auto; display:block; background:#3182CE; color:white; padding:15px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${t.startKo}</button>`;
            }

            // 3. Spielpläne der einzelnen Gruppen rendern
            state.groups.forEach(g => {
                const mList = activeMatches.filter(m => !m.groupId || m.groupId === g.id).sort((a,b) => a.finished - b.finished);
                html += `
                    <div class="ad-group-section">
                        <div class="ad-group-match-header">${t.schedule} ${g.id}</div>
                        <div class="ad-group-match-container">
                            ${mList.map(m => window.adMatchbox.render(m, activeMatches.indexOf(m), 'group')).join('')}
                        </div>
                    </div>`;
            });

            return html;
        }
    };
})();
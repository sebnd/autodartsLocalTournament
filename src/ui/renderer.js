(function() {
    const { PAGE_ID } = window.adTourney.constants;

    const style = document.createElement('style');
    style.innerHTML = `
        #autodarts-tools-config { flex: 1 !important; height: 100vh !important; overflow-y: auto !important; padding: 20px !important; margin: 0 !important; position: relative; z-index: 10; }
        .tournament-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tournament-title { font-size: 36px; font-weight: 800; color: white; text-transform: uppercase; margin: 0; }
        .header-actions { display: flex; align-items: center; gap: 15px; }
        .ad-btn-styled { border-radius: 8px; font-weight: bold; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-reset { background: #E53E3E; color: white; padding: 10px 20px; text-transform: uppercase; font-size: 13px; }
        .view-tabs { display: flex; gap: 8px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 10px; }
        .tab-btn { padding: 8px 18px; background: transparent; color: #718096; cursor: pointer; font-weight: bold; font-size: 12px; border-radius: 6px; transition: 0.2s; text-transform: uppercase; border: none; }
        .tab-btn.active { color: white; background: #3182CE; }
        
        .settings-box { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        .setting-item { margin-bottom: 8px; }
        .setting-label { font-size: 14px; font-weight: bold; color: white; margin-bottom: 4px; text-transform: uppercase; display: block; }
        .setting-btn-group { display: flex; background: #2D3748; border-radius: 6px; overflow: hidden; border: 1px solid #4A5568; }
        .setting-btn { flex: 1; padding: 10px 4px; background: transparent; border: none; color: #CBD5E0; cursor: pointer; font-size: 14px; border-right: 1px solid #4A5568; }
        .setting-btn:last-child { border-right: none; }
        .setting-btn.active { background: #3182CE; color: white; }
        .setting-select { width: 100%; background: #2D3748; color: white; padding: 10px; border-radius: 6px; border: 1px solid #4A5568; outline: none; font-size: 14px; }
        
        .gear-btn { background: none; border: none; cursor: pointer; font-size: 20px; padding: 5px; filter: brightness(0) invert(1); opacity: 1; transition: 0.2s; }
        .gear-btn:hover { opacity: 0.8; }

        .settings-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .settings-modal { background: #2D3748; width: 450px; padding: 25px; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: white; }
        .close-modal { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    function renderSettingsHTML(settings) {
        const groups = [
            { label: 'Base score', key: 'baseScore', opts: [121, 170, 301, 501, 701, 901] },
            { label: 'In mode', key: 'inMode', opts: ['Straight', 'Double', 'Master'] },
            { label: 'Out mode', key: 'outMode', opts: ['Straight', 'Double', 'Master'] },
            { label: 'Max Runden', key: 'maxRounds', opts: [15, 20, 50, 80] },
            { label: 'Bull mode', key: 'bullMode', opts: ['25/50', '50/50'] },
            { label: 'Bull-off', key: 'bullOffMode', opts: ['Off', 'Normal', 'Official'] }
        ];
        return `
            <div class="settings-content">
                ${groups.map(g => `
                    <div class="setting-item">
                        <label class="setting-label">${g.label}</label>
                        <div class="setting-btn-group">
                            ${g.opts.map(opt => `<button class="setting-btn ${settings[g.key] == opt ? 'active' : ''}" data-key="${g.key}" data-val="${opt}">${opt}</button>`).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="setting-item">
                    <label class="setting-label">Spielmodus: Legs (First to...)</label>
                    <select class="setting-select" id="target-legs-select">
                        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${settings.targetLegs == n ? 'selected' : ''}>First to ${n} Leg${n>1?'s':''}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    window.adTourney.renderUI = function() {
        const { state, syncMatchResults, actions } = window.adTourney;
        const container = document.getElementById(PAGE_ID); if (!container) return;

        if (syncMatchResults) syncMatchResults();
        
        let headerHtml = `<div class="tournament-header"><h1 class="tournament-title">Lokales Turnier</h1><div class="header-actions">
            ${(state.step !== 'SETUP') ? `
                <button class="gear-btn" id="gear-toggle">⚙️</button>
                <div class="view-tabs">
                    ${state.mode === 'GROUPS' ? `<button class="tab-btn ${state.view === 'GROUPS' ? 'active' : ''}" data-view="GROUPS">GRUPPENPHASE</button>` : ''}
                    ${state.mode === 'LEAGUE' ? `<button class="tab-btn ${state.view === 'LEAGUE' ? 'active' : ''}" data-view="LEAGUE">LIGA</button>` : ''}
                    ${state.mode !== 'LEAGUE' && (state.step === 'ACTIVE' || state.view === 'KO') ? `<button class="tab-btn ${state.view === 'KO' ? 'active' : ''}" data-view="KO">KO-PHASE</button>` : ''}
                </div>
                <button id="reset-t" class="ad-btn-styled btn-reset">Zurücksetzen</button>
            ` : ''}
        </div></div>`;

        let bodyHtml = `<div class="bracket-wrapper ${state.view === 'KO' ? 'is-ko' : 'is-groups'}">`;
        if (state.step === 'SETUP') {
            bodyHtml += window.adSetup.render(state);
        }
        else if (state.view === 'LEAGUE') bodyHtml += window.adLeague.render(state, container.offsetWidth, window.adTourney.getCurrentlyAdvancing);
        else if (state.view === 'GROUPS') bodyHtml += window.adGroups.render(state, container.offsetWidth, window.adTourney.getCurrentlyAdvancing);
        else bodyHtml += window.adBracket.render(state.rounds, state.matches, state.reachable);
        
        bodyHtml += `</div>`;

        if (state.showSettings) {
            bodyHtml += `<div class="settings-overlay"><div class="settings-modal">
                <div class="modal-header"><h3>EINSTELLUNGEN ANPASSEN</h3><button class="close-modal">✕</button></div>
                ${renderSettingsHTML(state.settings)}
                <button class="ad-btn-styled" style="width:100%; background:#38A169; color:white; padding:12px; margin-top:15px;" id="close-settings">SPEICHERN & SCHLIESSEN</button>
            </div></div>`;
        }

        container.innerHTML = headerHtml + bodyHtml;
        attachEvents();
    };

    function attachEvents() {
        const { state, save, renderUI, actions, updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory, createKOBracket, getCurrentlyAdvancing } = window.adTourney;
        const root = document.getElementById(PAGE_ID); if (!root) return;
        const b = (id) => document.getElementById(id);
        
        if (b('reset-t')) b('reset-t').onclick = actions.resetTournament;
        if (b('gear-toggle')) b('gear-toggle').onclick = actions.toggleSettingsPopup;
        if (root.querySelector('.close-modal')) root.querySelector('.close-modal').onclick = actions.toggleSettingsPopup;
        if (b('close-settings')) b('close-settings').onclick = actions.toggleSettingsPopup;

        root.querySelectorAll('.setting-btn').forEach(btn => btn.onclick = () => {
            actions.updateGlobalSetting(btn.dataset.key, btn.dataset.val);
        });
        if (b('target-legs-select')) b('target-legs-select').onchange = (e) => actions.updateGlobalSetting('targetLegs', e.target.value);

        if (state.step === 'SETUP') {
            window.adSetup.attachEvents(root, state, { onLaunch: actions.startTournament, onUpdate: () => { save(); renderUI(); }, onSave: save, showModal: (cfg) => window.adModals.show(cfg) });
        }

        if (b('start-ko-final')) b('start-ko-final').onclick = () => {
            const qualifiers = getCurrentlyAdvancing(); createKOBracket(qualifiers.sort(() => Math.random() - 0.5));
            state.step = 'ACTIVE'; state.view = 'KO'; save(); renderUI();
        };

        root.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => { state.view = btn.dataset.view; save(); renderUI(); });
        
        root.querySelectorAll('.surrender-btn').forEach(btn => btn.onclick = (e) => { 
            const mIdx = parseInt(btn.dataset.m);
            const type = btn.closest('.match-box').querySelector('.play-match').dataset.type;
            const m = type === 'league' ? state.leagueMatches[mIdx] : (type === 'group' ? state.groupMatches[mIdx] : state.matches[mIdx]);
            window.adModals.show({ title: 'AUFGABE', text: `${btn.dataset.p === "1" ? m.p1 : m.p2} gibt auf?`, confirmText: 'Bestätigen', onConfirm: () => {
                m.winner = (btn.dataset.p === "1") ? m.p2 : m.p1; m.finished = true;
                m.results = { p1L: '0', p1A: '-', p2L: '0', p2A: '-' };
                if (type === 'group' || type === 'league') updateTable(m, state.groups); else { advanceWinner(mIdx); checkFinalVictory(mIdx); }
                if (type === 'league') checkLeagueVictory();
                state.activePlayer1Name = null; save(); renderUI();
            }});
        });

        root.querySelectorAll('.reset-match').forEach(btn => btn.onclick = () => {
            const idx = btn.dataset.idx; const type = btn.dataset.type;
            const m = type === 'league' ? state.leagueMatches[idx] : (type === 'ko' ? state.matches[idx] : state.groupMatches[idx]);
            window.adModals.show({
                title: 'MATCH ZURÜCKSETZEN?',
                text: `Möchtest du das Match zwischen ${m.p1} und ${m.p2} wirklich zurücksetzen? Die Verknüpfung wird gelöscht.`,
                confirmText: 'Ja, zurücksetzen',
                onConfirm: () => {
                    m.uuid = null; save(); renderUI();
                }
            });
        });

        root.querySelectorAll('.global-surrender-btn').forEach(btn => btn.onclick = (e) => actions.surrenderGlobally(btn.dataset.name));
        
        root.querySelectorAll('.play-match').forEach(btn => btn.onclick = () => {
            const idx = btn.dataset.idx;
            const type = btn.dataset.type;
            const m = type === 'league' ? state.leagueMatches[idx] : (type === 'ko' ? state.matches[idx] : state.groupMatches[idx]);
            if (m.uuid) window.location.href = `https://play.autodarts.io/matches/${m.uuid}`;
            else window.adTourney.startMatchDirectly(m.p1, m.p2, m);
        });
    }
})();
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .ad-setup-container { background: #1A202C; border: 1px solid #2D3748; border-radius: 12px; padding: 25px; max-width: 950px; }
        .mode-toggle { display: flex; gap: 10px; margin-bottom: 20px; }
        .mode-btn { flex: 1; padding: 12px; background: #2D3748; color: #CBD5E0; }
        .mode-btn.active { background: #3182CE !important; color: white !important; border: 1px solid #63B3ED; }
        
        .setup-main-layout { display: grid; grid-template-columns: 450px 1fr; gap: 30px; align-items: start; }
        
        .setup-config-box { display: flex; flex-wrap: wrap; gap: 10px; color: white; background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 8px; }
        .setup-config-item { flex: 1; min-width: 120px; }
        .input-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .setup-input { flex: 1; background: rgba(0, 0, 0, 0.2); border: 1px solid #4A5568; padding: 10px; border-radius: 6px; color: white; text-transform: uppercase; }
        .player-list-table { width: 100%; border-collapse: collapse; }
        .player-list-row { border-bottom: 1px solid #2D3748; }
        .player-list-name { padding: 10px; color: white; font-weight: bold; font-size: 17px; text-transform: uppercase; }
        .remove-p-btn { color: #FC8181; font-size: 18px; background: transparent; border: none; cursor: pointer; }
        
        .setup-setting-group { margin-bottom: 8px; width: 100%; }
        .setup-setting-label { font-size: 14px; font-weight: bold; color: white; margin-bottom: 4px; text-transform: uppercase; display: block; }
        .setup-btn-row { display: flex; background: #2D3748; border-radius: 6px; overflow: hidden; }
        .setup-btn-opt { flex: 1; padding: 10px 4px; background: transparent; border: none; color: #CBD5E0; cursor: pointer; font-size: 14px; border-right: 1px solid #4A5568; }
        .setup-btn-opt:last-child { border-right: none; }
        .setup-btn-opt.active { background: #3182CE; color: white; }
        .setup-select-field { width: 100%; background: #2D3748; color: white; padding: 10px; border-radius: 6px; border: 1px solid #4A5568; outline: none; font-size: 14px; }

        .setup-footer-row { display: flex; gap: 10px; margin-top: 20px; height: 50px; }
        #launch-btn { flex: 1; margin-top: 0 !important; height: 100%; }
        #full-reset-btn { background: #E53E3E; color: white; border: none; border-radius: 8px; cursor: pointer; height: 100%; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; font-size: 22px; transition: 0.2s; }
        #full-reset-btn:hover { background: #C53030; }
    `;
    document.head.appendChild(style);

    window.adSetup = {
        render: function(state) {
            const sizeOptions = [3, 4, 5, 6, 8, 10, 12, 24, 32];
            const advanceOptions = [2, 4, 8, 16, 32];
            const s = state.settings;

            const matchSettingsGroups = [
                { label: 'Base score', key: 'baseScore', opts: [121, 170, 301, 501, 701, 901] },
                { label: 'In mode', key: 'inMode', opts: ['Straight', 'Double', 'Master'] },
                { label: 'Out mode', key: 'outMode', opts: ['Straight', 'Double', 'Master'] },
                { label: 'Max Runden', key: 'maxRounds', opts: [15, 20, 50, 80] },
                { label: 'Bull mode', key: 'bullMode', opts: ['25/50', '50/50'] },
                { label: 'Bull-off', key: 'bullOffMode', opts: ['Off', 'Normal', 'Official'] }
            ];

            return `
            <div class="ad-setup-container">
                <div class="mode-toggle">
                    <button class="mode-btn ad-btn-styled ${state.mode === 'KO' ? 'active' : ''}" data-mode="KO">KO</button>
                    <button class="mode-btn ad-btn-styled ${state.mode === 'GROUPS' ? 'active' : ''}" data-mode="GROUPS">GRUPPEN + KO</button>
                    <button class="mode-btn ad-btn-styled ${state.mode === 'LEAGUE' ? 'active' : ''}" data-mode="LEAGUE">LIGA</button>
                </div>

                <div class="setup-main-layout">
                    <div class="setup-config-box">
                        ${matchSettingsGroups.map(g => `
                            <div class="setup-setting-group">
                                <label class="setup-setting-label">${g.label}</label>
                                <div class="setup-btn-row">
                                    ${g.opts.map(opt => `<button class="setup-btn-opt ${s[g.key] == opt ? 'active' : ''}" data-key="${g.key}" data-val="${opt}">${opt}</button>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                        
                        <div class="setup-setting-group">
                            <label class="setup-setting-label">Spielmodus: Legs (First to...)</label>
                            <select class="setup-select-field" id="target-legs-select-setup">
                                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${s.targetLegs == n ? 'selected' : ''}>First to ${n} Leg${n>1?'s':''}</option>`).join('')}
                            </select>
                        </div>

                        ${state.mode === 'GROUPS' ? `
                        <div style="width:100%; height:1px; background:rgba(255,255,255,0.1); margin:10px 0;"></div>
                        <div class="setup-config-item">
                            <label class="setup-setting-label">GRUPPENGRÖSSE</label>
                            <select id="group-size-select" class="setup-select-field">
                                ${sizeOptions.map(v => `<option value="${v}" ${state.groupSettings.size == v ? 'selected' : ''}>${v}</option>`).join('')}
                            </select>
                        </div>
                        <div class="setup-config-item">
                            <label class="setup-setting-label">QUALIFIKANTEN</label>
                            <select id="group-advance-select" class="setup-select-field">
                                ${advanceOptions.map(v => `<option value="${v}" ${state.groupSettings.totalAdvance == v ? 'selected' : ''}>${v}</option>`).join('')}
                            </select>
                        </div>` : ''}
                    </div>

                    <div class="player-setup-section">
                        <div class="input-row">
                            <input id="p-in" class="setup-input" placeholder="NAME...">
                            <button id="p-add" style="background:#3182CE; color:white; padding:0 20px; border-radius:6px; font-size:20px; border:none; cursor:pointer;">+</button>
                        </div>
                        <table class="player-list-table"><tbody>
                            ${state.players.map((p, i) => `
                                <tr class="player-list-row">
                                    <td class="player-list-name">${p}</td>
                                    <td style="text-align:right;"><button class="remove-p remove-p-btn" data-idx="${i}">✕</button></td>
                                </tr>`).join('')}
                        </tbody></table>
                    </div>
                </div>

                <div class="setup-footer-row">
                    <button id="launch-btn" style="background:#2F855A; color:white; border-radius:8px; font-weight:bold; text-transform:uppercase; border:none; cursor:pointer;">Starten</button>
                    <button id="full-reset-btn" title="Setup & Namen zurücksetzen">↺</button>
                </div>
            </div>`;
        },

        attachEvents: function(root, state, callbacks) {
            const b = (id) => document.getElementById(id);
            const inp = b('p-in');

            if (b('launch-btn')) b('launch-btn').onclick = callbacks.onLaunch;

            const addP = () => {
                if (document.querySelector('.ad-modal-overlay')) return;
                if (inp && inp.value.trim()) {
                    const v = inp.value.trim().toUpperCase();
                    if (state.players.includes(v)) {
                        callbacks.showModal({ title: 'DOPPELTER NAME', text: 'Dieser Name ist bereits im Turnier!', confirmText: 'OK' });
                    } else {
                        state.players.push(v);
                        inp.value = "";
                        callbacks.onUpdate();
                        setTimeout(() => document.getElementById('p-in')?.focus(), 10);
                    }
                }
            };

            if (b('p-add')) b('p-add').onclick = addP;
            if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') addP(); };

            root.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => {
                state.mode = btn.dataset.mode;
                callbacks.onUpdate();
            });

            root.querySelectorAll('.remove-p').forEach(btn => btn.onclick = () => {
                state.players.splice(btn.dataset.idx, 1);
                callbacks.onUpdate();
            });

            root.querySelectorAll('.setup-btn-opt').forEach(btn => btn.onclick = () => {
                state.settings[btn.dataset.key] = btn.dataset.val;
                callbacks.onUpdate();
            });
            if (b('target-legs-select-setup')) b('target-legs-select-setup').onchange = (e) => {
                state.settings.targetLegs = e.target.value;
                callbacks.onUpdate();
            };
            
            if (b('group-size-select')) b('group-size-select').onchange = (e) => { 
                state.groupSettings.size = parseInt(e.target.value); 
                callbacks.onSave(); 
            };
            if (b('group-advance-select')) b('group-advance-select').onchange = (e) => { 
                state.groupSettings.totalAdvance = parseInt(e.target.value); 
                callbacks.onSave(); 
            };

            if (b('full-reset-btn')) b('full-reset-btn').onclick = () => {
                if (window.adTourney.actions.fullReset) window.adTourney.actions.fullReset();
            };
        }
    };
})();
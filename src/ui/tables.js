(function() {
    // Styles für Tabellen, Gruppen-Karten und Surrender-Buttons
    const style = document.createElement('style');
    style.innerHTML = `
        .group-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .group-table th, .group-table td { padding: 8px 5px; border-bottom: 1px solid rgba(255,255,255,0.05); color: white; font-size: 14px; }
        .group-table th:nth-child(1), .group-table td:nth-child(1), .group-table th:nth-child(3), .group-table td:nth-child(3), .group-table th:nth-child(4), .group-table td:nth-child(4), .group-table th:nth-child(5), .group-table td:nth-child(5) { width: 65px; text-align: center; }
        .group-table th:nth-child(2), .group-table td:nth-child(2) { min-width: 150px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .adv-row { background: rgba(72, 187, 120, 0.15) !important; }
        .adv-row td:nth-child(2) { color: #48BB78 !important; font-weight: bold; }
        .global-surrender-btn { background: transparent; border: none; color: rgba(255,255,255,0.3); cursor: pointer; margin-left: 8px; font-size: 12px; vertical-align: middle; }
        .groups-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; width: 100%; }
        .group-card { background: #1A202C; border: 1px solid #2D3748; border-radius: 12px; padding: 15px; flex: 1 1 430px; min-width: 430px; }
    `;
    document.head.appendChild(style);

    window.adTables = {
        renderStandingGrid: function(groups, viewMode, surrenderedPlayers, advancingPlayers, containerWidth) {
            const isLeague = viewMode === 'LEAGUE';
            let html = '<div class="groups-grid" id="ad-grid-target">';
            
            groups.forEach(g => {
                const sorted = [...g.players].sort((a,b) => {
                    const isSurrA = surrenderedPlayers.includes(a.name); 
                    const isSurrB = surrenderedPlayers.includes(b.name);
                    if (isSurrA && !isSurrB) return 1; if (!isSurrA && isSurrB) return -1;
                    return b.wins - a.wins || b.diff - a.diff || (b.totalAvg || 0) - (a.totalAvg || 0);
                });
                
                let numSplits = 1;
                if (isLeague) {
                    const availableWidth = containerWidth - 40; 
                    const maxSplitsByWidth = Math.max(1, Math.floor(availableWidth / 450));
                    if (sorted.length > 16) numSplits = Math.min(3, maxSplitsByWidth);
                    else if (sorted.length > 8) numSplits = Math.min(2, maxSplitsByWidth);
                }
                
                const chunkSize = Math.ceil(sorted.length / numSplits);
                for (let s = 0; s < numSplits; s++) {
                    const chunk = sorted.slice(s * chunkSize, (s + 1) * chunkSize);
                    if (chunk.length === 0) continue;
                    
                    html += `<div class="group-card"><div style="font-weight:bold; color:#3182CE; margin-bottom:10px;">${isLeague ? 'LIGA' : 'GRUPPE ' + g.id}</div><table class="group-table"><thead><tr><th>POS</th><th>SPIELER</th><th>S</th><th>LEGS</th><th>AVG</th></tr></thead><tbody>`;
                    
                    chunk.forEach((p, idx) => {
                        const globalIdx = (s * chunkSize) + idx;
                        const isAdv = !isLeague && advancingPlayers.includes(p.name);
                        const isSurr = surrenderedPlayers.includes(p.name);
                        html += `<tr class="${isAdv ? 'adv-row' : ''}"><td>${globalIdx+1}</td><td style="${isSurr ? 'opacity:0.4; text-decoration:line-through;' : ''}">${p.name}<button class="global-surrender-btn" data-name="${p.name}">🏳</button></td><td>${p.wins}</td><td>${p.lf}:${p.la}</td><td>${(p.totalAvg || 0).toFixed(2)}</td></tr>`; 
                    });
                    
                    html += `</tbody></table></div>`;
                }
            });
            
            html += '</div>';
            return html;
        }
    };
})();
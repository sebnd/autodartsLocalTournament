(function() {
    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': { round: 'Runde' },
        'en': { round: 'Round' }
    };
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    // Styles für den Turnierbaum und die Linien
    const style = document.createElement('style');
    style.innerHTML = `
        .bracket-wrapper.is-ko { min-width: max-content; }
        .bracket-container { display: flex; flex-direction: row; gap: 40px; padding: 10px 0; align-items: flex-start; }
        .round-col { display: flex; flex-direction: column; min-width: 300px; }
        .round-title-row { height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; text-transform: uppercase; color: white; margin-bottom: 15px; }
        
        .is-ko .line-out { position: absolute; right: -20px; top: 30px; width: 20px; height: 2px; background: white; }
        .is-ko .line-fork { position: absolute; right: -20px; width: 2px; background: white; }
        .is-ko .line-into { position: absolute; right: -40px; top: calc(30px + 0px); width: 20px; height: 2px; background: white; }
    `;
    document.head.appendChild(style);

    window.adBracket = {
        render: function(rounds, matches, reachable) {
            const BOX_H = 60; 
            const BASE_GAP = 10; 
            let html = `<div class="bracket-container">`;

            rounds.forEach((r, rIdx) => {
                let matchesHtml = '';
                const currentMargin = (Math.pow(2, rIdx) * (BOX_H + BASE_GAP)) - BOX_H;
                const firstBoxOffset = (Math.pow(2, rIdx) - 1) * (BOX_H + BASE_GAP) / 2;
                const vForkHeight = (Math.pow(2, rIdx) * (BOX_H + BASE_GAP)) / 2;

                for (let i = r.start; i < r.start + r.count; i++) {
                    const m = matches[i]; 
                    const isReachable = reachable && reachable.includes(i);
                    const isTop = (i - r.start) % 2 === 0;
                    const styleStr = `margin-bottom: ${i === r.start + r.count - 1 ? '0' : currentMargin}px; ${i === r.start ? `margin-top: ${firstBoxOffset}px;` : ''}`;

                    if (!isReachable) {
                        matchesHtml += `<div style="width:300px; height:60px; visibility:hidden; ${styleStr}"></div>`;
                    } else {
                        matchesHtml += `<div style="${styleStr} position:relative;">
                            ${m.nextMatchIdx !== null ? `
                                <div class="line-out"></div>
                                <div class="line-fork" style="height:${vForkHeight}px; ${isTop ? 'top:30px; border-right:2px solid white;' : 'top:calc(30px - '+vForkHeight+'px); border-right:2px solid white;'}"></div>
                                ${isTop ? `<div class="line-into" style="top:calc(30px + ${vForkHeight}px);"></div>` : ''}
                            ` : ''}
                            ${window.adMatchbox.render(m, i, 'ko')}
                        </div>`;
                    }
                }
                html += `<div class="round-col"><div class="round-title-row">${t.round} ${r.round + 1}</div>${matchesHtml}</div>`;
            });

            html += `</div>`;
            return html;
        }
    };
})();
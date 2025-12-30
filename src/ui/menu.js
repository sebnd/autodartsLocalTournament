(function() {
    const { MENU_ITEM_ID, PAGE_ID, QUICK_LINK_ID } = window.adTourney.constants;

    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': { online: 'Online Turniere', local: 'Lokales Turnier' },
        'en': { online: 'Online tourn.', local: 'Local tourn.' }
    };
    // Fallback auf 'en', falls Sprache nicht in translations (z.B. bei 'de-DE' -> 'de' Mapping)
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    const menuStyle = document.createElement('style');
    menuStyle.innerHTML = `
        .ad-quick-link-btn { background: #38A169 !important; color: white !important; font-weight: 800 !important; font-size: 14px !important; padding: 0 25px !important; height: 40px !important; border-radius: 8px !important; text-transform: uppercase !important; border: none !important; cursor: pointer !important; box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.7); animation: ad-pulse-green 2s infinite; -webkit-font-smoothing: antialiased; backface-visibility: hidden; transform: translateZ(0); }
        @keyframes ad-pulse-green { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.7); } 70% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(56, 161, 105, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 161, 105, 0); } }
    `;
    document.head.appendChild(menuStyle);

    function inject() {
        if (!window.adTourney || !window.adTourney.renderUI) return;
        const { state, renderUI, syncMatchResults } = window.adTourney;

        // Der Aufruf von applyVisualRename() wurde hier entfernt, um den TypeError zu beheben.

        const targetBtn = document.querySelector('.navigation a[href="/tournaments"]');
        if (!targetBtn) return;

        // 1. Umbenennung des originalen Buttons basierend auf Sprache
        if (targetBtn.innerText === 'Turniere' || targetBtn.innerText === 'Tournaments') {
            targetBtn.innerHTML = targetBtn.innerHTML.replace(/Turniere|Tournaments/g, t.online);
        }

        // Sidebar Button Management
        const myBtn = document.getElementById(MENU_ITEM_ID);
        
        if (myBtn) {
            const targetClasses = Array.from(targetBtn.classList).filter(c => c.startsWith('css-')).join(' ');
            const myClasses = Array.from(myBtn.classList).filter(c => c.startsWith('css-')).join(' ');
            
            if (targetClasses !== myClasses) {
                myBtn.remove();
            } else if (targetBtn.nextSibling !== myBtn) {
                targetBtn.parentNode.insertBefore(myBtn, targetBtn.nextSibling);
            }
        }

        if (!document.getElementById(MENU_ITEM_ID)) {
            const btn = targetBtn.cloneNode(true);
            btn.id = MENU_ITEM_ID; 
            btn.removeAttribute('href');
            btn.setAttribute('aria-label', t.local); 
            btn.style.cursor = 'pointer';

            /**
             * 2. Umbenennung des geklonten Buttons basierend auf Sprache
             */
            btn.innerHTML = btn.innerHTML.replace(new RegExp(`${t.online}|Turniere|Tournaments`, 'g'), t.local);

            btn.onclick = () => {
                const nav = document.querySelector('.navigation');
                const layoutWrapper = nav?.parentElement;
                if (!layoutWrapper) return;
                let pg = document.getElementById(PAGE_ID);
                if (!pg) { pg = document.createElement('div'); pg.id = PAGE_ID; layoutWrapper.appendChild(pg); }
                Array.from(layoutWrapper.children).forEach(c => { if (c !== nav && c !== pg && !c.classList.contains('chakra-portal')) c.style.display = 'none'; });
                pg.style.display = 'block'; 
                if (syncMatchResults) syncMatchResults();
                renderUI();
            };
            targetBtn.parentNode.insertBefore(btn, targetBtn.nextSibling);
        }

        document.querySelectorAll('.navigation a').forEach(a => {
            if (!a.dataset.navInterceptorAdded && a.id !== MENU_ITEM_ID) {
                a.dataset.navInterceptorAdded = "true";
                a.addEventListener('click', () => {
                    const pg = document.getElementById(PAGE_ID);
                    if (pg) pg.style.display = 'none';
                    const nav = document.querySelector('.navigation');
                    if (nav && nav.parentElement) {
                        Array.from(nav.parentElement.children).forEach(c => {
                            if (c !== nav && c !== pg && !c.classList.contains('chakra-portal')) c.style.display = 'block';
                        });
                    }
                });
            }
        });

        if (window.location.pathname.includes('/history/matches/') && state.step !== 'SETUP') {
            const headerStack = document.querySelector('.chakra-card__header .chakra-stack');
            if (headerStack && !document.getElementById(QUICK_LINK_ID)) {
                const qBtn = document.createElement('button');
                qBtn.id = QUICK_LINK_ID; qBtn.className = 'ad-quick-link-btn'; qBtn.innerText = 'ZUM TURNIER';
                headerStack.appendChild(qBtn);
                qBtn.onclick = () => {
                    const nav = document.querySelector('.navigation');
                    const layoutWrapper = nav?.parentElement;
                    let pg = document.getElementById(PAGE_ID);
                    if (!pg) { pg = document.createElement('div'); pg.id = PAGE_ID; layoutWrapper.appendChild(pg); }
                    if (layoutWrapper && pg) {
                        Array.from(layoutWrapper.children).forEach(c => { if (c !== nav && c !== pg && !c.classList.contains('chakra-portal')) c.style.display = 'none'; });
                        pg.style.display = 'block'; 
                        if (syncMatchResults) syncMatchResults();
                        renderUI();
                    }
                };
            }
        }
    }

    const obs = new MutationObserver(() => inject());
    obs.observe(document.body, { childList: true, subtree: true });
    setInterval(inject, 1000);
})();
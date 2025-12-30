(function() {
    const { MENU_ITEM_ID, PAGE_ID, QUICK_LINK_ID } = window.adTourney.constants;

    const menuStyle = document.createElement('style');
    menuStyle.innerHTML = `
        .ad-quick-link-btn { background: #38A169 !important; color: white !important; font-weight: 800 !important; font-size: 14px !important; padding: 0 25px !important; height: 40px !important; border-radius: 8px !important; text-transform: uppercase !important; border: none !important; cursor: pointer !important; box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.7); animation: ad-pulse-green 2s infinite; -webkit-font-smoothing: antialiased; backface-visibility: hidden; transform: translateZ(0); }
        @keyframes ad-pulse-green { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.7); } 70% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(56, 161, 105, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 161, 105, 0); } }
    `;
    document.head.appendChild(menuStyle);

    function inject() {
        if (!window.adTourney || !window.adTourney.renderUI) return;
        const { state, applyVisualRename, renderUI, syncMatchResults } = window.adTourney;

        applyVisualRename();
        const targetBtn = document.querySelector('.navigation a[href="/tournaments"]');
        if (!targetBtn) return;

        // 1. Umbenennung des originalen Buttons zu "Online Turniere"
        if (targetBtn.innerText === 'Turniere' || targetBtn.innerText === 'Tournaments') {
            targetBtn.innerHTML = targetBtn.innerHTML.replace(/Turniere|Tournaments/g, 'Online Turniere');
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
            btn.setAttribute('aria-label', 'Lokales Turnier'); 
            btn.style.cursor = 'pointer';

            /**
             * 2. Umbenennung des geklonten Buttons zu "Lokales Turnier"
             * Wir ersetzen den Text des Klons (der evtl. schon "Online Turniere" vom Original geerbt hat).
             */
            btn.innerHTML = btn.innerHTML.replace(/Online Turniere|Turniere|Tournaments/g, 'Lokales Turnier');

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
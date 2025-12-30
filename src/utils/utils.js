(function() {
    window.adTourney = window.adTourney || {};

    /**
     * Ersetzt visuell den Namen eines lokalen Spielers (Standard: SEBND) 
     * durch den im Turnier gewählten Namen.
     */
    window.adTourney.applyVisualRename = function() {
        const { state } = window.adTourney;
        if (!state || !state.activePlayer1Name) return;

        const targetName = "SEBND";
        const newName = state.activePlayer1Name;
        
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toUpperCase().includes(targetName)) {
                node.textContent = node.textContent.replace(new RegExp(targetName, 'gi'), newName);
            }
        }

        document.querySelectorAll(`[aria-label*="${targetName.toLowerCase()}"], [aria-label*="${targetName}"]`).forEach(el => {
            el.setAttribute('aria-label', el.getAttribute('aria-label').replace(new RegExp(targetName, 'gi'), newName));
        });
    };
})();
(function() {
    const { STORAGE_KEY } = window.adTourney.constants; //

    // 1. Initialer State mit Standardwerten (Synchron für sofortige Verfügbarkeit)
    window.adTourney.state = {
        step: 'SETUP',
        mode: 'KO',
        view: 'KO',
        activePlayer1Name: null,
        groupSettings: { size: 4, totalAdvance: 8 },
        players: [],
        surrenderedPlayers: [],
        matches: [],
        groupMatches: [],
        leagueMatches: [],
        groups: [],
        rounds: [],
        reachable: [],
        showSettings: false,
        settings: {
            baseScore: 501,
            inMode: "Straight",
            outMode: "Double",
            maxRounds: 50,
            bullMode: "25/50",
            bullOffMode: "Normal",
            targetLegs: 2
        }
    }; //

    // 2. Daten asynchron aus dem offiziellen Chrome-Speicher laden
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const saved = result[STORAGE_KEY];
        if (saved) {
            // Bestehenden State mit den geladenen Daten mergen
            Object.assign(window.adTourney.state, saved);
            
            // UI-Refresh triggern, sobald die Daten aus dem Speicher geladen wurden
            if (window.adTourney.renderUI) window.adTourney.renderUI();
        }
    });

    // 3. Neue Speicher-Funktion via chrome.storage.local
    window.adTourney.save = function() {
        chrome.storage.local.set({ [STORAGE_KEY]: window.adTourney.state });
    }; //
})();
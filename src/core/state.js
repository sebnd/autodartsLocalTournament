(function() {
    const { STORAGE_KEY } = window.adTourney.constants;

    // 1. Initialer State mit Standardwerten
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
    };

    const applySavedData = (saved) => {
        if (saved) {
            Object.assign(window.adTourney.state, saved);
            if (window.adTourney.renderUI) window.adTourney.renderUI();
        }
    };

    // 2. Daten sicher laden (Chrome Storage oder LocalStorage Fallback)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            applySavedData(result[STORAGE_KEY]);
        });
    } else {
        const localSaved = localStorage.getItem(STORAGE_KEY);
        if (localSaved) {
            try {
                applySavedData(JSON.parse(localSaved));
            } catch (e) {
                console.error("Fehler beim Laden aus localStorage:", e);
            }
        }
    }

    // 3. Neue Speicher-Funktion mit Sicherheitsprüfung
    window.adTourney.save = function() {
        const stateToSave = window.adTourney.state;

        // Versuch, im Chrome-Speicher zu sichern (Extension-Kontext)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ [STORAGE_KEY]: stateToSave });
        }
        
        // Immer auch im localStorage sichern (Fallback / Userscript-Kontext)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    };
})();
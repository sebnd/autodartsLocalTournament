(function() {
    window.adTourney = window.adTourney || {}; //

    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': {
            title: 'BOARD-ID FEHLT',
            text: 'Dein Board wurde noch nicht erkannt. Bitte öffne einmal manuell eine Lobby und wähle dein Board aus, damit die ID gespeichert werden kann.',
            confirm: 'Verstanden'
        },
        'en': {
            title: 'BOARD-ID MISSING',
            text: 'Your board has not been detected yet. Please open a lobby manually once and select your board so that the ID can be saved.',
            confirm: 'Got it'
        }
    };
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    window.adTourney.startMatchDirectly = async function(p1Name, p2Name, matchObj) {
        const { state, save } = window.adTourney; //
        const s = state.settings; //

        const getAuthToken = () => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; Authorization=`);
            return parts.length === 2 ? parts.pop().split(';').shift() : null; //
        };

        const token = getAuthToken(); //
        if (!token) return console.error("❌ Kein Token gefunden!"); //

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }; //

        try {
            // 1. LOBBY ERSTELLEN
            const createRes = await fetch('https://api.autodarts.io/gs/v0/lobbies', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    variant: "X01",
                    isPrivate: true,
                    legs: parseInt(s.targetLegs),
                    settings: {
                        baseScore: parseInt(s.baseScore),
                        inMode: s.inMode,
                        outMode: s.outMode,
                        bullMode: s.bullMode,
                        maxRounds: parseInt(s.maxRounds),
                        bullOffMode: s.bullOffMode
                    }
                })
            }); //

            const lobby = await createRes.json(); //
            const lobbyId = lobby.id; //
            
            // AUTOMATISIERUNG: Versucht die Board-ID aus dem gesicherten chrome.storage.local zu lesen
            const storage = await new Promise(resolve => {
                chrome.storage.local.get(['autodarts-board'], resolve);
            });
            let boardId = storage['autodarts-board'];

            // Fallback: Falls noch nicht im chrome.storage vorhanden, direkt vom localStorage lesen
            if (!boardId) {
                boardId = localStorage.getItem('autodarts-board');
            }

            if (boardId) boardId = boardId.replace(/"/g, ''); 

            // Fehlermeldung, falls kein Board gefunden wurde
            if (!boardId || boardId === "") {
                window.adModals.show({ 
                    title: t.title, 
                    text: t.text, 
                    confirmText: t.confirm 
                }); //
                return;
            }

            // 2. SPIELER HINZUFÜGEN (Gäste)
            const addPlayer = (name) => fetch(`https://api.autodarts.io/gs/v0/lobbies/${lobbyId}/players`, {
                method: 'POST', headers, body: JSON.stringify({ name, boardId })
            }); //

            await addPlayer(p1Name); //
            await addPlayer(p2Name); //

            // 3. START
            await fetch(`https://api.autodarts.io/gs/v0/lobbies/${lobbyId}/start`, { method: 'POST', headers }); //

            matchObj.uuid = lobbyId; //
            save(); //
            window.location.href = `https://play.autodarts.io/matches/${lobbyId}`; //
        } catch (e) {
            console.error("❌ Fehler im Instant-Start:", e); //
        }
    };
})();
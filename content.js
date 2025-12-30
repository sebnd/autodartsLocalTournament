(function() {
    // AUTOMATISIERUNG: Sichert die Board-ID automatisch im chrome.storage.local
    const boardId = localStorage.getItem('autodarts-board');
    if (boardId) {
        chrome.storage.local.set({ 'autodarts-board': boardId });
    }

    // Initialer Aufruf zur Sicherstellung der Umgebung
    if (window.adTourney && window.adTourney.renderUI) {
        // Initialisierung erfolgt über MutationObserver in menu.js und lobby.js
    }
})();
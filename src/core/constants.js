(function() {
    window.adTourney = window.adTourney || {};
    window.adTourney.constants = {
        PAGE_ID: 'autodarts-tools-config',
        MENU_ITEM_ID: 'autodarts-local-tournaments-menu-item',
        QUICK_LINK_ID: 'ad-tourney-quick-link',
        STORAGE_KEY: 'ad_local_tourney',
        RENAME_TARGET: "SEBND",
        GROUP_SIZE_OPTIONS: [3, 4, 5, 6, 8, 10, 12, 24, 32],
        ADVANCE_OPTIONS: [2, 4, 8, 16, 32],
        URLS: {
            HISTORY: 'https://play.autodarts.io/history/matches/',
            LOBBY_NEW: 'https://play.autodarts.io/lobbies/new/x01',
            LOBBY_BASE: 'https://play.autodarts.io/lobbies/',
            MATCH_BASE: 'https://play.autodarts.io/matches/'
        }
    };
})();
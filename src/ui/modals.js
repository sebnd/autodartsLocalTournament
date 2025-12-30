(function() {
    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': { cancel: 'Abbrechen' },
        'en': { cancel: 'Cancel' }
    };
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    const style = document.createElement('style');
    style.innerHTML = `
        #ad-local-tournaments-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 9999; display: flex; justify-content: center; align-items: center; color: white; font-family: 'Inter', sans-serif; }
        .ad-overlay-content { background: #1a202c; width: 80%; max-width: 800px; height: 70vh; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; border: 1px solid #2d3748; }
        .ad-overlay-content header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2d3748; padding-bottom: 10px; margin-bottom: 20px; }
        .ad-body { flex-grow: 1; overflow-y: auto; }
        .ad-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.75); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 10001; }
        .ad-modal-content { background: #1A202C; border: 1px solid #2D3748; padding: 35px; border-radius: 16px; width: 420px; text-align: center; color: white; }
    `;
    document.head.appendChild(style);

    window.adModals = {
        show: function({ title, text, confirmText, onConfirm, isSuccess = false }) {
            if (document.querySelector('.ad-modal-overlay')) return;
            const overlay = document.createElement('div');
            overlay.className = 'ad-modal-overlay';
            overlay.innerHTML = `
                <div class="ad-modal-content">
                    <div style="font-size:24px; font-weight:800; color:white; margin-bottom:12px; text-transform:uppercase;">${title}</div>
                    <div style="color:#A0AEC0; margin-bottom:30px;">${text}</div>
                    <div style="display:flex; justify-content:center; gap:10px;">
                        <button class="ad-btn-styled" style="background:#4A5568; padding:10px 20px; border:none; color:white; border-radius:8px; cursor:pointer;">${t.cancel}</button>
                        <button class="ad-btn-styled" style="background:${isSuccess ? '#38A169' : '#E53E3E'}; padding:10px 20px; border:none; color:white; border-radius:8px; cursor:pointer;">${confirmText}</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            const btns = overlay.querySelectorAll('button');
            btns[0].onclick = () => document.body.removeChild(overlay);
            btns[1].onclick = () => { if (onConfirm) onConfirm(); document.body.removeChild(overlay); };
        }
    };
})();
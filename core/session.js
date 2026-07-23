export function initSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const rid = urlParams.get('rid');
    const table = urlParams.get('table');

    // URL se data nikal kar memory me save kar lo
    if (rid) localStorage.setItem('current_rid', rid);
    if (table) sessionStorage.setItem('current_table', table);

    // URL ko clean kar do taaki link neat dikhe
    if (rid || table) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

export function getSessionData() {
    return {
        rid: localStorage.getItem('current_rid') || 'rest_001', // Default ID for testing
        table: sessionStorage.getItem('current_table') || null
    };
}


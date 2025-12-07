
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
    
    console.log(`Cookie '${name}' berhasil disimpan untuk ${days} hari`);
}

function getCookie(name) {
    const cookieName = name + "=";
    const allCookies = document.cookie.split(';');
    
    for (let i = 0; i < allCookies.length; i++) {
        let cookie = allCookies[i];
        
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log(`Cookie '${name}' berhasil dihapus`);
}

function hasCookie(name) {
    const cookieValue = getCookie(name);
    return cookieValue !== "";
}

function saveUserLogin(username, rememberDays = 7) {
    setCookie("umkm_user", username, rememberDays);
    setCookie("umkm_login", "true", rememberDays);
    
    console.log(`User ${username} tersimpan untuk ${rememberDays} hari`);
}

function isUserLoggedIn() {
    return hasCookie("umkm_login") && getCookie("umkm_login") === "true";
}

function getLoggedInUser() {
    if (isUserLoggedIn()) {
        return getCookie("umkm_user");
    }
    return null;
}

function logoutUser() {
    deleteCookie("umkm_user");
    deleteCookie("umkm_login");
    console.log("User berhasil logout");
}

function saveUserPreference(key, value, days = 30) {
    const prefName = "umkm_pref_" + key;
    setCookie(prefName, value, days);
}

function getUserPreference(key) {
    const prefName = "umkm_pref_" + key;
    return getCookie(prefName);
}

function saveContentHistory(contentType, content, maxHistory = 5) {
    const historyKey = "umkm_history_" + contentType;
    let history = [];
    
    const existingHistory = getCookie(historyKey);
    if (existingHistory) {
        try {
            history = JSON.parse(existingHistory);
        } catch (e) {
            history = [];
        }
    }
    
    history.unshift({
        content: content,
        date: new Date().toLocaleDateString('id-ID')
    });
    
    if (history.length > maxHistory) {
        history = history.slice(0, maxHistory);
    }
    
    setCookie(historyKey, JSON.stringify(history), 30);
}

function getContentHistory(contentType) {
    const historyKey = "umkm_history_" + contentType;
    const history = getCookie(historyKey);
    
    if (history) {
        try {
            return JSON.parse(history);
        } catch (e) {
            return [];
        }
    }
    
    return [];
}

function showAllCookies() {
    console.log("Semua cookie yang tersimpan:");
    console.log(document.cookie);
}

function saveAuthSession(email, rememberMe = false) {
    setCookie("umkm_auth_email", email, rememberMe ? 30 : 1);
    
    if (rememberMe) {
        setCookie("umkm_remember_me", "true", 30);
    }
    
    setCookie("umkm_last_login", new Date().toISOString(), 7);
    
    console.log(`Session tersimpan untuk email: ${email}`);
}

function getAuthSession() {
    return {
        email: getCookie("umkm_auth_email"),
        rememberMe: getCookie("umkm_remember_me") === "true",
        lastLogin: getCookie("umkm_last_login")
    };
}

function clearAuthSession() {
    deleteCookie("umkm_auth_email");
    deleteCookie("umkm_remember_me");
    deleteCookie("umkm_last_login");
    console.log("Auth session dihapus");
}

// Cek apakah user punya remember me aktif
function hasRememberMe() {
    return hasCookie("umkm_remember_me") && getCookie("umkm_remember_me") === "true";
}

// Simpan statistik login user
function trackLoginStats() {
    // Hitung total login
    const currentLogins = parseInt(getCookie("umkm_login_count") || "0");
    setCookie("umkm_login_count", (currentLogins + 1).toString(), 365);
    
    // Simpan tanggal login terakhir
    setCookie("umkm_last_login_date", new Date().toLocaleDateString('id-ID'), 365);
}

// Ambil statistik login
function getLoginStats() {
    return {
        totalLogins: parseInt(getCookie("umkm_login_count") || "0"),
        lastLoginDate: getCookie("umkm_last_login_date"),
        lastLoginTime: getCookie("umkm_last_login")
    };
}

// ===== FUNGSI UNTUK MENAMPILKAN INFO COOKIE =====

// Tampilkan welcome message berdasarkan data cookie
function getWelcomeMessage() {
    const session = getAuthSession();
    const stats = getLoginStats();
    
    if (session.email) {
        if (stats.totalLogins > 1) {
            return `Selamat datang kembali! Ini login ke-${stats.totalLogins} Anda.`;
        } else {
            return `Selamat datang di AI UMKM! Terima kasih sudah bergabung.`;
        }
    }
    
    return 'Selamat datang di AI UMKM!';
}

// Cek apakah user adalah user baru (login pertama)
function isNewUser() {
    const stats = getLoginStats();
    return stats.totalLogins <= 1;
}

// Tampilkan debug info cookie (untuk development)
function showCookieDebugInfo() {
    console.log('=== DEBUG INFO COOKIE ===');
    console.log('Auth Session:', getAuthSession());
    console.log('Login Stats:', getLoginStats());
    console.log('Content History:', getContentHistory('caption'));
    console.log('All Cookies:', document.cookie);
    console.log('========================');
}

// ===== EXPORT FUNGSI KE WINDOW SCOPE =====
// Agar bisa dipanggil dari file JavaScript lain

// Export fungsi auth
window.saveAuthSession = saveAuthSession;
window.getAuthSession = getAuthSession;
window.clearAuthSession = clearAuthSession;
window.hasRememberMe = hasRememberMe;
window.trackLoginStats = trackLoginStats;
window.getLoginStats = getLoginStats;

// Export fungsi utility
window.getWelcomeMessage = getWelcomeMessage;
window.isNewUser = isNewUser;
window.showCookieDebugInfo = showCookieDebugInfo;

// Export fungsi content history
window.saveContentHistory = saveContentHistory;
window.getContentHistory = getContentHistory;

// Export fungsi user preference
window.saveUserPreference = saveUserPreference;
window.getUserPreference = getUserPreference;

console.log('✅ Cookie functions loaded successfully!');
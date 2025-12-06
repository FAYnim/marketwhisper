// ========================================
// AUTENTIKASI AMAN DENGAN NETLIFY FUNCTIONS
// ========================================
// Kredensial Supabase TIDAK lagi ada di frontend
// Semua operasi auth dilakukan lewat Netlify Functions
// API Key aman tersimpan di environment variables Netlify

// URL Netlify Function untuk autentikasi
const AUTH_FUNCTION_URL = '/.netlify/functions/auth';

// Simpan session token di localStorage
const SESSION_STORAGE_KEY = 'umkm_auth_session';

// Helper: Simpan session ke localStorage
function saveSession(session) {
    if (session && session.access_token) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
}

// Helper: Ambil session dari localStorage
function getStoredSession() {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored session:', e);
            return null;
        }
    }
    return null;
}

// Helper: Hapus session dari localStorage
function clearStoredSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Helper: Panggil Netlify Function
async function callAuthFunction(action, payload = {}) {
    try {
        const response = await fetch(AUTH_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                ...payload
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Auth function call error:', error);
        return { success: false, error: error.message };
    }
}

// Auth Functions
const Auth = {
    // Register new user
    async register(email, password, name) {
        try {
            const result = await callAuthFunction('register', {
                email,
                password,
                name
            });

            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { success: true, data: result.data };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    },

    // Login user
    async login(email, password, rememberMe = false) {
        try {
            const result = await callAuthFunction('login', {
                email,
                password
            });

            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Simpan session ke localStorage
            if (result.data && result.data.session) {
                saveSession(result.data.session);
            }
            
            // Jika login berhasil, simpan ke cookie (jika fungsi tersedia)
            if (result.data.user) {
                if (typeof window.saveAuthSession === 'function') {
                    window.saveAuthSession(email, rememberMe);
                }
                if (typeof window.trackLoginStats === 'function') {
                    window.trackLoginStats();
                }
            }
            
            return { success: true, data: result.data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logout() {
        try {
            const session = getStoredSession();
            const accessToken = session ? session.access_token : null;

            const result = await callAuthFunction('logout', {
                accessToken
            });

            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Hapus session dari localStorage
            clearStoredSession();
            
            // Hapus semua cookie auth saat logout (jika fungsi tersedia)
            if (typeof window.clearAuthSession === 'function') {
                window.clearAuthSession();
            }
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            
            // Tetap hapus session lokal meskipun logout gagal
            clearStoredSession();
            if (typeof window.clearAuthSession === 'function') {
                window.clearAuthSession();
            }
            
            return { success: false, error: error.message };
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const session = getStoredSession();
            const accessToken = session ? session.access_token : null;

            const result = await callAuthFunction('getUser', {
                accessToken
            });

            if (!result.success) {
                // Jika gagal karena session invalid, hapus session lokal
                if (result.error && result.error.includes('session')) {
                    clearStoredSession();
                }
                throw new Error(result.error);
            }
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Get user error:', error);
            
            // If session missing, it's not really an error - user just not logged in
            if (error.message && error.message.includes('session')) {
                clearStoredSession();
                return { success: true, user: null };
            }
            
            return { success: false, error: error.message };
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const { success, user } = await this.getCurrentUser();
        return success && user !== null;
    },

    // Listen to auth state changes (tidak tersedia di serverless, gunakan polling)
    // Catatan: Fitur ini terbatas karena tidak ada websocket di Netlify Functions
    onAuthStateChange(callback) {
        console.warn('onAuthStateChange tidak tersedia dengan Netlify Functions. Gunakan polling manual.');
        // Return dummy unsubscribe function
        return () => {};
    },

    // Tukar code dari URL supaya sesi aktif setelah konfirmasi email
    async exchangeCodeForSession(code) {
        try {
            const result = await callAuthFunction('exchangeCode', {
                code
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Simpan session baru ke localStorage
            if (result.data && result.data.session) {
                saveSession(result.data.session);
            }

            return { success: true, data: result.data };
        } catch (error) {
            console.error('Exchange code error:', error);
            return { success: false, error: error.message };
        }
    },

    // Cek apakah email user sudah terverifikasi
    async isEmailVerified() {
        try {
            const { success, user, error } = await this.getCurrentUser();

            if (!success || error) {
                return { success: false, verified: false, error: error || 'Tidak bisa mendapatkan data user' };
            }

            if (!user) {
                return { success: false, verified: false, error: 'User belum login' };
            }

            const verified = Boolean(user.email_confirmed_at);

            return { success: true, verified: verified, user: user };
        } catch (error) {
            console.error('Email verification check error:', error);
            return { success: false, verified: false, error: error.message };
        }
    },

    // Get session
    async getSession() {
        try {
            const session = getStoredSession();
            const accessToken = session ? session.access_token : null;

            const result = await callAuthFunction('getSession', {
                accessToken
            });

            if (!result.success) {
                // Jika gagal, hapus session lokal
                clearStoredSession();
                throw new Error(result.error);
            }
            
            // Update session di localStorage jika ada perubahan
            if (result.session) {
                saveSession(result.session);
            }
            
            return { success: true, session: result.session };
        } catch (error) {
            console.error('Get session error:', error);
            
            // Handle session missing as normal case
            if (error.message && error.message.includes('session')) {
                clearStoredSession();
                return { success: true, session: null };
            }
            
            return { success: false, error: error.message };
        }
    },

    // Check if user has remember me enabled
    hasRememberMe() {
        if (typeof window.hasRememberMe === 'function') {
            return window.hasRememberMe();
        }
        return false;
    },

    // Get remembered email for auto-fill
    getRememberedEmail() {
        if (typeof window.getAuthSession === 'function') {
            const session = window.getAuthSession();
            return session.email || '';
        }
        return '';
    },

    // Get login statistics
    getLoginStats() {
        if (typeof window.getLoginStats === 'function') {
            return window.getLoginStats();
        }
        return { totalLogins: 0, lastLoginDate: null, lastLoginTime: null };
    },

    // Initialize auth system and check for valid session
    async initAuth() {
        try {
            // Check if we have a valid Supabase session
            const { success, session } = await this.getSession();
            
            if (success && session && session.user) {
                // Valid session exists, user is authenticated
                console.log('Valid session found:', session.user.email);
                return { authenticated: true, user: session.user };
            }
            
            // No valid session, check for remember me cookie
            if (typeof window.hasRememberMe === 'function' && window.hasRememberMe()) {
                console.log('No active session but remember me is enabled');
                // Clear cookie since session is invalid
                if (typeof window.clearAuthSession === 'function') {
                    window.clearAuthSession();
                }
            }
            
            return { authenticated: false, user: null };
        } catch (error) {
            console.error('Auth initialization error:', error);
            
            // Clear potentially corrupted cookies
            if (typeof window.clearAuthSession === 'function') {
                window.clearAuthSession();
            }
            
            return { authenticated: false, user: null };
        }
    }
};

// Auth Guard - Protect pages that require authentication
async function requireAuth() {
    const { success, user } = await Auth.getCurrentUser();
    
    if (!success || !user) {
        // User not authenticated, redirect to login
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Redirect if already authenticated (for login/register pages)
async function redirectIfAuthenticated() {
    const { success, user } = await Auth.getCurrentUser();
    
    if (success && user) {
        // User already authenticated, redirect to dashboard
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return false;
}

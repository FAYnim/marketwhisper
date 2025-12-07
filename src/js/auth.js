const AUTH_FUNCTION_URL = '/.netlify/functions/auth';

const SESSION_STORAGE_KEY = 'umkm_auth_session';

function saveSession(session) {
    if (session && session.access_token) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
}

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

function clearStoredSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

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

const Auth = {
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

    async login(email, password, rememberMe = false) {
        try {
            const result = await callAuthFunction('login', {
                email,
                password
            });

            if (!result.success) {
                throw new Error(result.error);
            }
            
            if (result.data && result.data.session) {
                saveSession(result.data.session);
            }
            
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
            
            clearStoredSession();
            
            if (typeof window.clearAuthSession === 'function') {
                window.clearAuthSession();
            }
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            
            clearStoredSession();
            if (typeof window.clearAuthSession === 'function') {
                window.clearAuthSession();
            }
            
            return { success: false, error: error.message };
        }
    },

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
            
            if (error.message && error.message.includes('session')) {
                clearStoredSession();
                return { success: true, user: null };
            }
            
            return { success: false, error: error.message };
        }
    },

    async isAuthenticated() {
        const { success, user } = await this.getCurrentUser();
        return success && user !== null;
    },

    onAuthStateChange(callback) {
        console.warn('onAuthStateChange tidak tersedia dengan Netlify Functions. Gunakan polling manual.');
        // Return dummy unsubscribe function
        return () => {};
    },

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

    getAccessToken() {
        const session = getStoredSession();
        return session ? session.access_token : null;
    },

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

    hasRememberMe() {
        if (typeof window.hasRememberMe === 'function') {
            return window.hasRememberMe();
        }
        return false;
    },

    getRememberedEmail() {
        if (typeof window.getAuthSession === 'function') {
            const session = window.getAuthSession();
            return session.email || '';
        }
        return '';
    },

    getLoginStats() {
        if (typeof window.getLoginStats === 'function') {
            return window.getLoginStats();
        }
        return { totalLogins: 0, lastLoginDate: null, lastLoginTime: null };
    },

    async initAuth() {
        try {
            const { success, session } = await this.getSession();
            
            if (success && session && session.user) {
                console.log('Valid session found:', session.user.email);
                return { authenticated: true, user: session.user };
            }
            
            if (typeof window.hasRememberMe === 'function' && window.hasRememberMe()) {
                console.log('No active session but remember me is enabled');
                if (typeof window.clearAuthSession === 'function') {
                    window.clearAuthSession();
                }
            }
            
            return { authenticated: false, user: null };
        } catch (error) {
            console.error('Auth initialization error:', error);
            
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
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

async function redirectIfAuthenticated() {
    const { success, user } = await Auth.getCurrentUser();
    
    if (success && user) {
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return false;
}

// Supabase Configuration
// IMPORTANT: Ganti dengan kredensial Anda sendiri dari https://supabase.com
const SUPABASE_URL = 'https://hgrpljzalzbinlillkij.supabase.co'; // Contoh: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncnBsanphbHpiaW5saWxsa2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDQzOTQsImV4cCI6MjA4MDM4MDM5NH0.IXyL3sGMumUiwLelDyteimQRMSQAPBcRstxsAHROEaQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Functions
const Auth = {
    // Register new user
    async register(email, password, name) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;
            
            return { success: true, data: data };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    },

    // Login user
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            
            return { success: true, data: data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const { user } = await this.getCurrentUser();
        return user !== null;
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    },

    // Get session
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            return { success: true, session: session };
        } catch (error) {
            console.error('Get session error:', error);
            return { success: false, error: error.message };
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

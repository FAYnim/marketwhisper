// netlify/functions/auth.js
// Netlify Function untuk handle semua operasi autentikasi Supabase
// Kredensial API disimpan di environment variables Netlify, tidak terexpose ke frontend
const { createClient } = require('@supabase/supabase-js');

// Headers untuk CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle OPTIONS untuk CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Pastikan method POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { action, email, password, name, accessToken, code } = JSON.parse(event.body);

    // Buat Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // REGISTER: Daftar user baru
    if (action === 'register') {
      const emailRedirectUrl = `${process.env.URL || 'http://localhost:8888'}/email-confirmation.html`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: emailRedirectUrl,
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // LOGIN: Login dengan email dan password
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // LOGOUT: Logout user
    if (action === 'logout') {
      // Perlu access token untuk logout
      if (!accessToken) {
        throw new Error('Access token required for logout');
      }

      // Buat client dengan access token user
      const supabaseWithAuth = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        }
      );

      const { error } = await supabaseWithAuth.auth.signOut();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    // GET_USER: Ambil data user dari access token
    if (action === 'getUser') {
      if (!accessToken) {
        // Tidak ada token = user belum login (bukan error)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, user: null })
        };
      }

      // Buat client dengan access token user
      const supabaseWithAuth = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        }
      );

      const { data: { user }, error } = await supabaseWithAuth.auth.getUser();

      // Jika session missing, return null (bukan error)
      if (error && error.message.includes('Auth session missing')) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, user: null })
        };
      }

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user })
      };
    }

    // GET_SESSION: Ambil session dari access token
    if (action === 'getSession') {
      if (!accessToken) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, session: null })
        };
      }

      const supabaseWithAuth = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        }
      );

      const { data: { session }, error } = await supabaseWithAuth.auth.getSession();

      if (error && error.message.includes('Auth session missing')) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, session: null })
        };
      }

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, session })
      };
    }

    // EXCHANGE_CODE: Tukar code dari email confirmation jadi session
    if (action === 'exchangeCode') {
      if (!code) {
        throw new Error('Code required for exchange');
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // Action tidak dikenali
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
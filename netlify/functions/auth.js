const { createClient } = require('@supabase/supabase-js');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { action, email, password, name, accessToken, code } = JSON.parse(event.body);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
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
    if (action === 'logout') {
  
      if (!accessToken) {
        throw new Error('Access token required for logout');
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

      const { error } = await supabaseWithAuth.auth.signOut();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
    if (action === 'getUser') {
      if (!accessToken) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, user: null })
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

      const { data: { user }, error } = await supabaseWithAuth.auth.getUser();
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
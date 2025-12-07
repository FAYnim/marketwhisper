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
    const { action, accessToken, productData, productId, category, searchTerm } = JSON.parse(event.body);

    // Buat Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Jika ada accessToken, set auth header
    let supabaseWithAuth = supabase;
    if (accessToken) {
      supabaseWithAuth = createClient(
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
    }

    // CREATE: Tambah produk baru
    if (action === 'create') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      // Get current user untuk ambil user_id
      const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Prepare product data
      const product = {
        user_id: user.id,
        name: productData.name,
        category: productData.category,
        price: parseInt(productData.price),
        description: productData.description,
        image: productData.image || null
      };
      const { data, error } = await supabaseWithAuth
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // READ ALL: Ambil semua produk user
    if (action === 'getAll') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      // Get products (RLS akan filter by user_id otomatis)
      const { data, error } = await supabaseWithAuth
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data || [] })
      };
    }

    // READ BY ID: Ambil satu produk
    if (action === 'getById') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!productId) {
        throw new Error('Product ID required');
      }

      const { data, error } = await supabaseWithAuth
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // UPDATE: Update produk
    if (action === 'update') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!productId) {
        throw new Error('Product ID required');
      }

      // Prepare update data
      const updates = {
        name: productData.name,
        category: productData.category,
        price: parseInt(productData.price),
        description: productData.description,
        image: productData.image || null
      };

      // Update di Supabase
      const { data, error } = await supabaseWithAuth
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    // DELETE: Hapus produk
    if (action === 'delete') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!productId) {
        throw new Error('Product ID required');
      }

      const { data, error } = await supabaseWithAuth
        .from('products')
        .delete()
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data })
      };
    }

    if (action === 'getByCategory') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!category) {
        throw new Error('Category required');
      }

      const { data, error } = await supabaseWithAuth
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data || [] })
      };
    }

    if (action === 'search') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!searchTerm) {
        throw new Error('Search term required');
      }

      const { data, error } = await supabaseWithAuth
        .from('products')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data || [] })
      };
    }

    // COUNT: Get total products
    if (action === 'count') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      const { count, error } = await supabaseWithAuth
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, count: count || 0 })
      };
    }

    if (action === 'getCategoryStats') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      const { data, error } = await supabaseWithAuth
        .from('products')
        .select('category');

      if (error) throw error;
      const stats = {};
      (data || []).forEach(product => {
        stats[product.category] = (stats[product.category] || 0) + 1;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: stats })
      };
    }

    // Action tidak dikenali
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Products function error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

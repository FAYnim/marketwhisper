const { createClient } = require('@supabase/supabase-js');

// Headers untuk CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const STORAGE_BUCKET = 'product-images';
const MAX_UPLOAD_MB = 3;

// Rapikan nama file supaya aman dipakai di URL
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

exports.handler = async (event, context) => {
  // Handle OPTIONS untuk CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // UPLOAD IMAGE
    if (event.httpMethod === 'POST') {
      const { action, accessToken, fileName, fileData, folder = 'uploads' } = JSON.parse(event.body);

      if (action === 'upload') {
        if (!accessToken) {
          throw new Error('Access token required');
        }

        if (!fileName || !fileData) {
          throw new Error('File name dan data harus ada');
        }

        // Ngebuat authenticated supabase client
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

        // Get current user untuk ambil user_id
        const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        // Validate file type dari base64 data
        if (!fileData.startsWith('data:image/')) {
          throw new Error('File harus berupa gambar (jpg/png/webp)');
        }

        // Convert base64 to buffer
        const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Check file size
        const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
        if (buffer.length > maxBytes) {
          throw new Error(`Ukuran file maksimal ${MAX_UPLOAD_MB}MB`);
        }

        // Generate file path
        const fileExt = fileName.split('.').pop();
        const baseName = sanitizeFileName(fileName.replace(/\.[^.]+$/, '')) || 'gambar';
        const filePath = `${folder}/${user.id}-${Date.now()}-${baseName}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, buffer, {
            contentType: fileData.split(';')[0].split(':')[1],
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            path: data.path,
            url: publicData.publicUrl
          })
        };
      }
    }

    // DELETE IMAGE
    if (event.httpMethod === 'DELETE') {
      const { accessToken, filePath } = JSON.parse(event.body);

      if (!accessToken) {
        throw new Error('Access token required');
      }

      if (!filePath) {
        throw new Error('File path required');
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

      // Verify user
      const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Delete from storage
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    // Method tidak didukung
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Upload function error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
// Supabase Storage uploader untuk gambar sederhana
// Pastikan supabase client sudah dibuat di auth.js

const STORAGE_BUCKET = 'product-images';
const MAX_UPLOAD_MB = 3; // batas aman agar ringan untuk UMKM

// Rapikan nama file supaya aman dipakai di URL
function sanitizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Upload gambar ke Supabase Storage
async function uploadImage(file, folder = 'uploads') {
    try {
        if (!file) {
            throw new Error('File tidak ditemukan');
        }

        if (!file.type || !file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar (jpg/png/webp)');
        }

        const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new Error(`Ukuran file maksimal ${MAX_UPLOAD_MB}MB`);
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Silakan login sebelum upload');
        }

        const fileExt = file.name.split('.').pop();
        const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, '')) || 'gambar';
        const filePath = `${folder}/${user.id}-${Date.now()}-${baseName}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data: publicData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return {
            success: true,
            path: data.path,
            url: publicData.publicUrl
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

// Hapus file dari Storage jika dibutuhkan
async function deleteImage(filePath) {
    try {
        if (!filePath) {
            throw new Error('Path file kosong');
        }

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

// Ekspor ke global supaya mudah dipakai di HTML
window.ImageUploader = {
    uploadImage,
    deleteImage
};

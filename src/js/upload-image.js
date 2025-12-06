// Image uploader menggunakan Netlify Functions
// Tidak perlu supabase client di frontend lagi

const MAX_UPLOAD_MB = 3; // batas aman agar ringan untuk UMKM

// Convert file ke base64 untuk dikirim ke netlify function
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Upload gambar melalui Netlify Functions
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

        // Ambil access token dari auth
        const accessToken = Auth.getAccessToken();
        if (!accessToken) {
            throw new Error('Silakan login sebelum upload');
        }

        // Convert file ke base64
        const fileData = await fileToBase64(file);

        // Kirim ke Netlify Function
        const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'upload',
                accessToken: accessToken,
                fileName: file.name,
                fileData: fileData,
                folder: folder
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Upload gagal');
        }

        return result;
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

// Hapus file dari Storage melalui Netlify Functions
async function deleteImage(filePath) {
    try {
        if (!filePath) {
            throw new Error('Path file kosong');
        }

        // Ambil access token dari auth
        const accessToken = Auth.getAccessToken();
        if (!accessToken) {
            throw new Error('Silakan login sebelum hapus gambar');
        }

        // Kirim ke Netlify Function
        const response = await fetch('/.netlify/functions/upload', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken: accessToken,
                filePath: filePath
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Hapus gambar gagal');
        }

        return result;
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

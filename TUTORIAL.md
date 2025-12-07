# Tutorial Instalasi Lokal UMKM Boost

Panduan ini akan membantu Anda menjalankan proyek UMKM Boost di komputer lokal Anda untuk keperluan pengembangan atau testing.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal dan memiliki hal-hal berikut:

1.  **Node.js** (Versi 18 atau lebih baru direkomendasikan) - [Download Node.js](https://nodejs.org/)
2.  **NPM** (Biasanya sudah terinstal bersama Node.js)
3.  **Git** - [Download Git](https://git-scm.com/)
4.  **Akun Supabase** (Untuk database dan autentikasi) - [Daftar Supabase](https://supabase.com/)
5.  **API Key Google Gemini** (Untuk fitur AI) - [Dapatkan API Key](https://aistudio.google.com/app/apikey)

## Langkah-langkah Instalasi

### 1. Clone Repository

Buka terminal atau command prompt, lalu clone repository ini ke komputer Anda:

```bash
git clone https://github.com/FAYnim/UMKMBoost.git
cd UMKMBoost
```

*(Catatan: Sesuaikan nama folder jika berbeda setelah clone)*

### 2. Install Dependencies

Install semua library yang dibutuhkan oleh proyek menggunakan NPM:

```bash
npm install
```

### 3. Konfigurasi Database (Supabase)

Proyek ini menggunakan Supabase untuk menyimpan data produk dan autentikasi pengguna.

1.  Buat proyek baru di dashboard Supabase Anda.
2.  Masuk ke menu **SQL Editor** di dashboard Supabase.
3.  Buka file `assets/data/products.sql` yang ada di folder proyek ini. Salin isinya dan jalankan di SQL Editor Supabase.
4.  Buka file `assets/data/ai-usage.sql`. Salin isinya dan jalankan juga di SQL Editor Supabase.

Langkah ini akan membuat tabel `products` dan `ai_usage` beserta aturan keamanannya (RLS).

### 4. Konfigurasi Environment Variables

Buat file baru bernama `.env` di root folder proyek (sejajar dengan `package.json`).

Salin konfigurasi berikut ke dalam file `.env` dan isi dengan kredensial Anda:

```env
# Konfigurasi Supabase (Dapatkan dari Project Settings > API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Konfigurasi Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Opsional (Default: http://localhost:8888)
URL=http://localhost:8888
```

### 5. Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai server pengembangan lokal:

```bash
npm run dev
```

Perintah ini akan menjalankan Netlify Dev server. Tunggu hingga muncul pesan bahwa server telah berjalan, biasanya dapat diakses di:

`http://localhost:8888`

## Struktur Proyek

*   `src/`: Berisi kode sumber frontend (HTML, CSS, JS).
*   `netlify/functions/`: Berisi kode backend (Serverless Functions) untuk API.
*   `assets/`: Berisi gambar, ikon, dan data SQL.

## Troubleshooting

*   **Error "Netlify CLI not found"**: Jika `npm run dev` gagal, coba install Netlify CLI secara global terlebih dahulu: `npm install -g netlify-cli`.
*   **Masalah Koneksi Database**: Pastikan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di file `.env` sudah benar.
*   **AI Tidak Merespon**: Pastikan `GEMINI_API_KEY` valid dan memiliki kuota.

Selamat mencoba!

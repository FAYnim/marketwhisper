# 🚀 Quick Start - Autentikasi Aman dengan Netlify Functions

## Setup Cepat

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy template
copy .env.example .env

# Edit .env dengan kredensial Supabase Anda
```

### 3. Jalankan Development Server
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:8888`

## ✅ Yang Sudah Berubah

- ❌ Kredensial Supabase TIDAK lagi di frontend
- ✅ Semua auth lewat `/.netlify/functions/auth`
- ✅ API keys aman di environment variables
- ✅ Session disimpan di localStorage (frontend)

## 📖 Dokumentasi Lengkap

Baca: [MIGRATION_AUTH.md](./MIGRATION_AUTH.md)

## 🧪 Test Auth Function

```bash
# Test langsung ke function
curl -X POST http://localhost:8888/.netlify/functions/auth ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"login\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## 🔒 Keamanan

Kredensial Supabase sekarang hanya ada di:
- ✅ File `.env` (local, tidak di-commit)
- ✅ Netlify Environment Variables (production)
- ❌ TIDAK ada di browser/frontend

## 🚀 Deploy ke Production

1. Push ke GitHub
2. Connect ke Netlify
3. Set environment variables di Netlify Dashboard
4. Deploy otomatis!

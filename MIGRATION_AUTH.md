# 🔐 Panduan Migrasi Autentikasi ke Netlify Functions

## ✅ Perubahan yang Telah Dilakukan

### 1. **Netlify Function** (`netlify/functions/auth.js`)
File ini sekarang handle semua operasi autentikasi dengan Supabase:

- ✅ `register` - Daftar user baru
- ✅ `login` - Login dengan email/password
- ✅ `logout` - Logout user
- ✅ `getUser` - Ambil data user dari token
- ✅ `getSession` - Ambil session dari token
- ✅ `exchangeCode` - Tukar code email confirmation jadi session

### 2. **Frontend Auth** (`src/js/auth.js`)
- ❌ **DIHAPUS**: Kredensial Supabase (SUPABASE_URL & SUPABASE_ANON_KEY)
- ❌ **DIHAPUS**: Direct Supabase client initialization
- ✅ **DITAMBAH**: Call ke Netlify Functions via `/.netlify/functions/auth`
- ✅ **DITAMBAH**: Session management dengan localStorage
- ✅ Semua fungsi tetap sama, hanya cara kerjanya yang berubah

### 3. **Environment Variables** (`.env.example`)
Template untuk environment variables yang diperlukan.

---

## 📋 Cara Setup

### Development Lokal

1. **Install Netlify CLI** (jika belum):
```bash
npm install -g netlify-cli
```

2. **Copy environment variables**:
```bash
copy .env.example .env
```

3. **Edit file `.env`** dengan kredensial Supabase Anda:
```env
SUPABASE_URL=https://hgrpljzalzbinlillkij.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
URL=http://localhost:8888
```

4. **Install dependencies**:
```bash
npm install
```

5. **Jalankan dev server dengan Netlify**:
```bash
netlify dev
```

Site akan buka di `http://localhost:8888` dengan Netlify Functions aktif.

---

### Production (Netlify)

1. **Push code ke GitHub**

2. **Connect repo ke Netlify**

3. **Set Environment Variables** di Netlify Dashboard:
   - Go to: Site Settings > Environment Variables
   - Tambahkan:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
   - `URL` akan auto-generated oleh Netlify

4. **Deploy!** 🚀

---

## 🔒 Keamanan

### Sebelum (❌ TIDAK AMAN)
```javascript
// Frontend (terexpose di browser)
const SUPABASE_URL = 'https://...';
const SUPABASE_ANON_KEY = 'eyJ...'; // ❌ Terlihat di browser
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Setelah (✅ AMAN)
```javascript
// Frontend - Hanya panggil function
const result = await callAuthFunction('login', { email, password });

// Netlify Function (server-side) - API key aman
const supabase = createClient(
  process.env.SUPABASE_URL,      // ✅ Hanya ada di server
  process.env.SUPABASE_ANON_KEY  // ✅ Tidak terexpose
);
```

---

## 📝 Cara Pakai di Kode

Tidak ada perubahan di cara pakai! Semua fungsi tetap sama:

```javascript
// Register
const result = await Auth.register(email, password, name);

// Login
const result = await Auth.login(email, password, rememberMe);

// Logout
const result = await Auth.logout();

// Get user
const { success, user } = await Auth.getCurrentUser();

// Get session
const { success, session } = await Auth.getSession();

// Exchange code (untuk email confirmation)
const result = await Auth.exchangeCodeForSession(code);

// Check if authenticated
const isAuth = await Auth.isAuthenticated();

// Check email verified
const { verified, user } = await Auth.isEmailVerified();
```

---

## 🧪 Testing

### Test Netlify Functions Lokal

1. Start server:
```bash
netlify dev
```

2. Test auth function langsung:
```bash
# Test login
curl -X POST http://localhost:8888/.netlify/functions/auth ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"login\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test di Browser

1. Buka Developer Tools > Network
2. Login/register
3. Lihat request ke `/.netlify/functions/auth`
4. Pastikan tidak ada kredensial Supabase di request

---

## 🐛 Troubleshooting

### Error: "Function not found"
- Pastikan jalankan `netlify dev`, bukan server biasa
- Cek file ada di `netlify/functions/auth.js`

### Error: "SUPABASE_URL is not defined"
- Cek file `.env` sudah ada dan terisi
- Restart `netlify dev` setelah edit `.env`

### Error: "Session missing"
- Normal jika user belum login
- Cek localStorage ada `umkm_auth_session`

### CORS Error
- Sudah di-handle di Netlify Function
- Pastikan request ke `/.netlify/functions/auth`

---

## 📊 Flow Autentikasi Baru

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │ 1. Login request
       ▼
┌──────────────────────────┐
│  Netlify Function        │
│  /.netlify/functions/auth│
└──────┬───────────────────┘
       │ 2. Call Supabase
       │    (dengan API key dari env)
       ▼
┌──────────────┐
│   Supabase   │
│   Auth API   │
└──────┬───────┘
       │ 3. Return session
       ▼
┌──────────────────────────┐
│  Netlify Function        │
│  Return to browser       │
└──────┬───────────────────┘
       │ 4. Session token
       ▼
┌──────────────┐
│   Browser    │
│  Save to     │
│  localStorage│
└──────────────┘
```

---

## ✨ Keuntungan

1. ✅ **Keamanan**: API keys tidak terexpose di browser
2. ✅ **Rate Limiting**: Bisa tambah rate limiting di function
3. ✅ **Logging**: Bisa log semua auth attempts
4. ✅ **Validasi**: Bisa tambah validasi extra di server
5. ✅ **Flexibility**: Gampang ganti auth provider tanpa ubah frontend

---

## 🚀 Next Steps

1. Test semua fitur auth (register, login, logout)
2. Test email confirmation flow
3. Test di production setelah deploy
4. Monitor logs di Netlify Dashboard
5. Opsional: Tambah rate limiting & monitoring

---

## 📚 Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Environment Variables Netlify](https://docs.netlify.com/environment-variables/overview/)

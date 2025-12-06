# 🚀 Command Reference - Quick Copy

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
copy .env.example .env

# 3. Edit .env dengan kredensial Supabase Anda
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key-here

# 4. Run development server
npm run dev
```

---

## Testing Auth Function

### Test Login
```bash
curl -X POST http://localhost:8888/.netlify/functions/auth -H "Content-Type: application/json" -d "{\"action\":\"login\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Register
```bash
curl -X POST http://localhost:8888/.netlify/functions/auth -H "Content-Type: application/json" -d "{\"action\":\"register\",\"email\":\"newuser@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

### Test Get User (perlu access token)
```bash
curl -X POST http://localhost:8888/.netlify/functions/auth -H "Content-Type: application/json" -d "{\"action\":\"getUser\",\"accessToken\":\"your-access-token-here\"}"
```

---

## Git Commands

```bash
# Add all changes
git add .

# Commit
git commit -m "Refactor: Secure authentication with Netlify Functions"

# Push
git push origin feature/crud-product
```

---

## Netlify Deployment

### Setup Environment Variables di Netlify Dashboard
```
1. Go to: Site Settings > Environment Variables
2. Add variables:
   - SUPABASE_URL: https://your-project.supabase.co
   - SUPABASE_ANON_KEY: your-anon-key-here
3. Save
4. Trigger redeploy
```

---

## Troubleshooting Commands

### Check if Netlify CLI is installed
```bash
netlify --version
```

### Install Netlify CLI globally
```bash
npm install -g netlify-cli
```

### Login to Netlify
```bash
netlify login
```

### Link to existing site
```bash
netlify link
```

### Check function logs
```bash
netlify functions:list
netlify functions:invoke auth --payload "{\"action\":\"login\",\"email\":\"test@test.com\",\"password\":\"pass123\"}"
```

---

## Browser Console Commands

### Check localStorage session
```javascript
// Lihat session yang tersimpan
console.log(localStorage.getItem('umkm_auth_session'));

// Parse session
JSON.parse(localStorage.getItem('umkm_auth_session'));

// Hapus session
localStorage.removeItem('umkm_auth_session');

// Clear all localStorage
localStorage.clear();
```

### Test Auth from Console
```javascript
// Test login
const result = await Auth.login('test@example.com', 'password123');
console.log(result);

// Get current user
const user = await Auth.getCurrentUser();
console.log(user);

// Get session
const session = await Auth.getSession();
console.log(session);

// Logout
const logout = await Auth.logout();
console.log(logout);
```

---

## Package.json Scripts

```bash
# Development (dengan Netlify Functions)
npm run dev

# Build (jika ada)
npm run build

# Test
npm test
```

---

## File Locations Quick Reference

```
Backend Auth:
  netlify/functions/auth.js

Frontend Auth:
  src/js/auth.js

HTML Files:
  login.html
  register.html
  dashboard.html
  email-confirmation.html

Configuration:
  .env (local - tidak di-commit)
  .env.example (template)
  package.json
  netlify.toml

Documentation:
  MIGRATION_AUTH.md
  SETUP_AUTH.md
  AUTH_REFACTOR_SUMMARY.md
  REFACTOR_CHECKLIST.md
  COMMANDS.md (this file)
```

---

## Environment Variables Template

Copy this to `.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://hgrpljzalzbinlillkij.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncnBsanphbHpiaW5saWxsa2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDQzOTQsImV4cCI6MjA4MDM4MDM5NH0.IXyL3sGMumUiwLelDyteimQRMSQAPBcRstxsAHROEaQ

# Netlify Site URL
URL=http://localhost:8888
```

---

## Common Issues & Fixes

### Issue: Function not found
```bash
# Fix: Pastikan jalankan dengan netlify dev
npm run dev
# BUKAN: python -m http.server atau live-server
```

### Issue: SUPABASE_URL is not defined
```bash
# Fix: Cek .env ada dan terisi, lalu restart
netlify dev --force
```

### Issue: Session hilang
```javascript
// Check di browser console
localStorage.getItem('umkm_auth_session')
// Jika null, session memang belum tersimpan atau sudah logout
```

### Issue: CORS Error
```bash
# Sudah di-handle di auth.js
# Pastikan request ke: /.netlify/functions/auth
# BUKAN langsung ke Supabase
```

---

## Production URL Examples

```
Development:
  http://localhost:8888
  http://localhost:8888/.netlify/functions/auth

Production:
  https://your-site.netlify.app
  https://your-site.netlify.app/.netlify/functions/auth
```

---

**Quick Start:**
```bash
npm install && copy .env.example .env && npm run dev
```

**One-line test:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/auth -H "Content-Type: application/json" -d "{\"action\":\"login\",\"email\":\"test@test.com\",\"password\":\"pass123\"}"
```

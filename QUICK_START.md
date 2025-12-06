# 🚀 QUICK START CARD

## ⚡ 3 Steps to Run

```bash
# 1. Install
npm install

# 2. Setup
copy .env.example .env

# 3. Run
npm run dev
```

Open: `http://localhost:8888`

---

## 🔑 Environment Variables (.env)

```env
SUPABASE_URL=https://hgrpljzalzbinlillkij.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncnBsanphbHpiaW5saWxsa2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDQzOTQsImV4cCI6MjA4MDM4MDM5NH0.IXyL3sGMumUiwLelDyteimQRMSQAPBcRstxsAHROEaQ
URL=http://localhost:8888
```

---

## ✅ What's New?

- ✅ **Auth now secure** - Credentials only on server
- ✅ **No Supabase CDN** - Removed from all HTML files
- ✅ **Netlify Functions** - All auth via `/.netlify/functions/auth`
- ✅ **Session in localStorage** - Key: `umkm_auth_session`

---

## 🧪 Quick Test

```bash
# Test login function
curl -X POST http://localhost:8888/.netlify/functions/auth -H "Content-Type: application/json" -d "{\"action\":\"login\",\"email\":\"test@test.com\",\"password\":\"pass123\"}"
```

---

## 📖 Documentation

- `SETUP_AUTH.md` - Quick start guide
- `MIGRATION_AUTH.md` - Full migration guide
- `COMMANDS.md` - All commands
- `FINAL_SUMMARY.md` - Complete summary

---

## 🚀 Deploy to Production

```bash
# 1. Push
git add .
git commit -m "Secure auth with Netlify Functions"
git push

# 2. Set env vars in Netlify Dashboard
# 3. Deploy!
```

---

## 🆘 Troubleshooting

### Function not found?
```bash
# Must use netlify dev, not regular server
npm run dev
```

### Session not saving?
```javascript
// Check in browser console
localStorage.getItem('umkm_auth_session')
```

### CORS error?
Make sure request goes to `/.netlify/functions/auth`, not directly to Supabase.

---

**STATUS:** ✅ READY TO USE  
**Security:** 🔒 SECURE  
**Docs:** 📚 COMPLETE

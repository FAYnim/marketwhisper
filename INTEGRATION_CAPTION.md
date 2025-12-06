# 📝 Integrasi AI Caption Generator

## Ringkasan Perubahan

Fitur **AI Caption Generator** sekarang sudah terintegrasi dengan Gemini AI, mengikuti pola yang sama dengan **AI Ideas Generator**.

---

## 🔄 Flow Kerja Caption Generator

### 1. User Flow
```
User mengisi form → Submit → Loading → AI Generate Caption → Display Result
```

### 2. Technical Flow
```
caption.html 
  ↓
ai-caption.js (handleCaptionSubmit)
  ↓
ai-caption.js (generateCaption)
  ↓
handler/gemini.js (callAI)
  ↓
netlify/functions/gemini.js (Netlify Function)
  ↓
assets/instructions/caption.md (Instruction File)
  ↓
Gemini AI API
  ↓
Response → Parse → Display
```

---

## 📁 File yang Diubah

### 1. **caption.html**
- ✅ Menambahkan `<script src="handler/gemini.js"></script>` sebelum ai-caption.js

### 2. **src/js/ai-caption.js**
Fungsi baru yang ditambahkan:

#### a. `createCaptionPrompt(formData)`
Membuat prompt AI berdasarkan input user:
- Tema/topik caption
- Tone (Ramah, Profesional, Antusias, Kasual)
- Panjang caption (Pendek/Sedang/Panjang → 75/150/250 kata)
- CTA (opsional)
- Data produk (jika ada produk terpilih)

#### b. `parseAICaptionResponse(aiResponse, formData)`
Parse response dari AI:
- Extract caption text
- Extract hashtags (atau generate default)
- Extract CTA (atau gunakan input user/default)

#### c. `parseTextCaptionResponse(textResponse, formData)`
Fallback parser jika JSON parsing gagal

#### d. `extractHashtags(text)`
Extract hashtags dari caption text menggunakan regex `/#\w+/g`

#### e. `extractCTA(text)`
Extract CTA dari caption menggunakan pattern matching:
- Kata-kata CTA: hubungi, dm, chat, pesan, order, dll.
- Emoji CTA: 💬, 📞, 🛒

#### f. `loadSelectedProductForCaption()`
Load produk terpilih dan pre-fill topic input

#### g. `clearSelectedProductForCaption()`
Clear produk terpilih dan reset form

#### Perubahan pada fungsi existing:
- ✅ `generateCaption()` → ubah dari dummy setTimeout ke async AI call
- ✅ `handleCaptionSubmit()` → ubah jadi async function

### 3. **netlify/functions/gemini.js**
- ✅ Tambahkan mapping `caption: "caption.md"` di fungsi `mapInstructionFile()`

### 4. **assets/instructions/caption.md**
File instruction sudah ada dan siap digunakan dengan format:
- Peran: Generator Caption Media Sosial
- Output: JSON dengan field `caption`
- Parameter: Tema, Tone, Panjang, CTA
- Aturan khusus per tone (Ramah, Profesional, Antusias, Kasual)

---

## 🎯 Fitur yang Sudah Terintegrasi

### Input dari User:
1. ✅ Tema/Topik Caption
2. ✅ Tone/Gaya Bahasa (4 pilihan)
3. ✅ Panjang Caption (3 pilihan)
4. ✅ CTA (opsional)
5. ✅ Data Produk (opsional, dari products.html)

### Output AI:
1. ✅ Caption text yang menarik
2. ✅ Hashtags relevan (max 8)
3. ✅ Call to Action yang persuasif

### Error Handling:
1. ✅ Try-catch untuk AI call
2. ✅ Fallback ke dummy data jika AI error
3. ✅ Toast notification untuk user feedback
4. ✅ Loading state selama AI processing

---

## 🧪 Cara Testing

### Test Manual:
1. Buka `caption.html`
2. Login terlebih dahulu
3. Isi form caption:
   - Tema: "Promo makan siang hemat"
   - Tone: "Ramah & Santai"
   - Panjang: "Sedang"
   - CTA: (kosong untuk auto)
4. Klik "Generate Caption"
5. Tunggu AI processing
6. Cek hasil caption, hashtags, dan CTA

### Test dengan Produk:
1. Buka `products.html`
2. Pilih produk → klik "Promosi AI"
3. Otomatis redirect ke caption.html
4. Topic sudah pre-filled dengan nama produk
5. Generate caption

---

## 📊 Mapping Data

### Tone Mapping:
```javascript
{
  'friendly': 'Ramah & Santai',
  'professional': 'Profesional',
  'enthusiastic': 'Antusias & Energik',
  'casual': 'Kasual & Menghibur'
}
```

### Length Mapping:
```javascript
{
  'short': '75',    // kata
  'medium': '150',  // kata
  'long': '250'     // kata
}
```

---

## 🔧 Troubleshooting

### Issue: AI tidak generate caption
**Solusi:**
- Cek console log untuk error message
- Pastikan Netlify Function sudah deploy
- Pastikan GEMINI_API_KEY sudah di-set di environment variables
- Cek koneksi internet

### Issue: Hashtags tidak muncul
**Solusi:**
- Fungsi `extractHashtags()` akan fallback ke `generateTopicHashtags()`
- Generate berdasarkan keywords di topic

### Issue: CTA tidak sesuai
**Solusi:**
- User bisa input CTA manual di form
- Atau AI akan generate otomatis
- Atau fallback ke `generateDefaultCTA()`

---

## 🎉 Summary

Integrasi **AI Caption Generator** sudah **SELESAI** dengan fitur:

✅ Real-time AI generation menggunakan Gemini API  
✅ Support multiple tone & length options  
✅ Auto hashtag generation  
✅ Smart CTA extraction/generation  
✅ Integration dengan product selection  
✅ Error handling & fallback mechanism  
✅ Loading states & user feedback  

Sistem bekerja dengan pola yang sama seperti **AI Ideas Generator** untuk konsistensi dan maintainability.

# PDF Toolkit - Urdu Guide (اردو گائیڈ)

## خلاصہ (Summary)
تمام PDF ٹولز اب مکمل طور پر کام کر رہے ہیں! `pdf-lib` لائبریری استعمال کرتے ہوئے تمام فیچرز implement کر دیے گئے ہیں۔

## کیا کام کر رہا ہے؟

### ✅ پہلے سے کام کرنے والے ٹولز
1. **Merge PDF** - کئی PDFs کو ایک میں ملائیں
2. **Split PDF** - صفحات نکالیں یا الگ الگ فائلیں بنائیں
3. **Compress PDF** - فائل کا سائز کم کریں
4. **Rotate PDF** - صفحات کو گھمائیں
5. **Delete Pages** - غیر ضروری صفحات ہٹائیں

### ✨ نئے شامل کیے گئے ٹولز
6. **Watermark** - ٹیکسٹ واٹرمارک شامل کریں
7. **Signature** - دستخط شامل کریں
8. **PDF to Word** - PDF کو Word میں تبدیل کریں
9. **Word to PDF** - Word کو PDF میں تبدیل کریں (اب Enterprise Engine کے ساتھ)
10. **Background Remover** - تصاویر کا بیک گراؤنڈ ختم کریں (Professional AI Model کے ساتھ)

## کیسے استعمال کریں؟

### 1. Watermark Tool
```
1. /watermark پر جائیں
2. PDF فائل اپ لوڈ کریں
3. واٹرمارک ٹیکسٹ لکھیں (مثال: "CONFIDENTIAL")
4. Opacity ایڈجسٹ کریں (0.1 سے 1.0)
5. Font Size ایڈجسٹ کریں (24px سے 96px)
6. "Add Watermark" پر کلک کریں
7. فائل ڈاؤن لوڈ کریں
```

**مثال:**
- ٹیکسٹ: "خفیہ دستاویز"
- Opacity: 0.3 (ہلکا)
- Font Size: 48px

### 2. Signature Tool
```
1. /signature پر جائیں
2. PDF فائل اپ لوڈ کریں
3. دستخط کا ٹیکسٹ لکھیں (مثال: "احمد علی")
4. صفحہ نمبر منتخب کریں
5. X اور Y پوزیشن سیٹ کریں
6. "Add Signature" پر کلک کریں
7. فائل ڈاؤن لوڈ کریں
```

**نوٹ:** پوزیشن کوآرڈینیٹس صفحے کے نچلے بائیں کونے سے ہیں۔

### 3. PDF to Word
```
1. /pdf-to-word پر جائیں
2. PDF فائل اپ لوڈ کریں
3. "Convert to Word" پر کلک کریں
4. DOCX فائل ڈاؤن لوڈ کریں
```

**اہم:** یہ basic conversion ہے۔ پیچیدہ formatting شاید محفوظ نہ ہو۔

### 4. Word to PDF (Enterprise Engine)
```
1. /word-to-pdf پر جائیں
2. DOCX فائل اپ لوڈ کریں
3. "Convert to PDF" پر کلک کریں
4. PDF فائل ڈاؤن لوڈ کریں
```

**ضروری نوٹ:** یہ اب ایک "Industrial Grade" انجن ہے جو **LibreOffice** استعمال کرتا ہے۔ اگر آپ کو "spawn soffice ENOENT" کا ایرر ملے، تو اس کا مطلب ہے کہ آپ کے کمپیوٹر پر LibreOffice انسٹال نہیں ہے۔ اسے انسٹال کرنے کے بعد `.env` فائل میں اس کا راستہ (Path) درست کریں۔

## سرورز کیسے چلائیں؟

### Backend شروع کریں:
```bash
cd backend
npm run dev
```
چلے گا: http://localhost:5000

### Frontend شروع کریں:
```bash
cd frontend
npm run dev
```
چلے گا: http://localhost:3000

## اگر کوئی ٹول کام نہیں کر رہا؟

### 1. Backend چیک کریں
```bash
# Health check کریں
curl http://localhost:5000/health
```

### 2. Cloudinary Configuration چیک کریں
- `.env` فائل میں credentials چیک کریں
- Cloud Name صحیح ہے؟
- API Key صحیح ہے؟
- API Secret صحیح ہے؟

### 3. Browser Console چیک کریں
- F12 دبائیں
- Console tab میں errors دیکھیں
- Network tab میں failed requests چیک کریں

### 4. Backend Logs چیک کریں
- Terminal میں error messages دیکھیں
- Cloudinary upload کی کامیابی چیک کریں

## تمام API Endpoints

```
POST /api/pdf/merge          - PDFs ملائیں
POST /api/pdf/split          - PDF تقسیم کریں
POST /api/pdf/compress       - PDF compress کریں
POST /api/pdf/rotate         - صفحات گھمائیں
POST /api/pdf/delete-pages   - صفحات حذف کریں
POST /api/pdf/watermark      - واٹرمارک شامل کریں
POST /api/pdf/sign           - دستخط شامل کریں
POST /api/pdf/pdf-to-word    - PDF کو Word میں
POST /api/pdf/word-to-pdf    - Word کو PDF میں
```

## فائلیں جو تبدیل کی گئیں

### Backend:
1. `backend/src/controllers/pdfController.ts`
   - `addWatermark` function شامل
   - `addSignature` function شامل
   - `pdfToWord` function شامل
   - `wordToPdf` function شامل

2. `backend/src/routes/pdfRoutes.ts`
   - تمام نئے routes enable کیے

### Frontend:
1. `frontend/app/watermark/page.tsx` - مکمل implement
2. `frontend/app/signature/page.tsx` - مکمل implement
3. `frontend/app/pdf-to-word/page.tsx` - مکمل implement
4. `frontend/app/word-to-pdf/page.tsx` - مکمل implement

## استعمال شدہ Libraries

- **pdf-lib** (v1.17.1) - PDF manipulation کے لیے
- **docx** (v8.5.0) - Word documents بنانے کے لیے
- **axios** - HTTP requests کے لیے
- **cloudinary** - فائل storage کے لیے
- **multer** - فائل upload کے لیے

## خصوصیات (Features)

### Watermark Tool:
✅ کسٹم ٹیکسٹ
✅ Opacity control (0.1 to 1.0)
✅ Font size control (24px to 96px)
✅ تمام صفحات پر 45° angle میں
✅ Cloudinary پر محفوظ

### Signature Tool:
✅ کسٹم signature text
✅ کسی بھی صفحے پر
✅ X, Y position control
✅ Underline کے ساتھ
✅ Cloudinary پر محفوظ

### PDF to Word:
✅ Basic text extraction
✅ Page count اور metadata
✅ DOCX format میں
✅ Cloudinary پر محفوظ
⚠️ پیچیدہ formatting محفوظ نہیں ہوتی

### 5. Background Remover (Professional Model)
```
1. /bg-remover پر جائیں
2. تصویر اپ لوڈ کریں
3. "Remove Background" پر کلک کریں
4. AI آپ کے تصویر کا بیک گراؤنڈ خودکار طور پر صاف کر دے گا
5. ہائی ریزولیوشن (HD) تصویر ڈاؤن لوڈ کریں
```

**اہم نوٹ (1GB RAM Solution):**
اگر آپ کا سرور 1GB RAM والا ہے اور AI Model لوڈ نہیں ہو رہا، تو آپ کو **Swap File** بنانی ہوگی۔ یہ کمانڈز اپنے سرور (Terminal) میں چلائیں:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
اس سے سرور کی میموری بڑھ جائے گی اور ہائی ماڈل (Bria RMBG) آرام سے چلے گا۔

## مستقبل کی بہتریاں

### Production کے لیے:
1. **PDF to Word:**
   - OCR service (Tesseract)
   - pdf-parse library
   - Images اور tables preserve کریں

2. **Word to PDF:**
   - LibreOffice headless integration
   - Gotenberg API
   - Cloud services (CloudConvert)

3. **Watermark:**
   - Image watermark support
   - Multiple positions
   - Custom fonts

4. **Signature:**
   - Canvas-based drawing
   - Image upload
   - Digital certificates

## خلاصہ

✅ **تمام 9 ٹولز مکمل طور پر کام کر رہے ہیں:**
1. Merge PDF ✓
2. Split PDF ✓
3. Compress PDF ✓
4. Rotate PDF ✓
5. Delete Pages ✓
6. Watermark ✓ (نیا)
7. Signature ✓ (نیا)
8. PDF to Word ✓ (نیا)
9. Word to PDF ✓ (نیا)

## ٹیسٹ کیسے کریں؟

1. دونوں سرورز چلائیں (backend اور frontend)
2. http://localhost:3000 پر جائیں
3. کسی بھی ٹول پر کلک کریں
4. فائل اپ لوڈ کریں
5. Settings configure کریں
6. Process کریں
7. ڈاؤن لوڈ کریں

## مدد کی ضرورت ہو تو:

1. `IMPLEMENTATION_SUMMARY.md` پڑھیں (تفصیلی انگلش گائیڈ)
2. Backend logs چیک کریں
3. Browser console چیک کریں
4. Cloudinary configuration verify کریں

---

**نوٹ:** تمام فائلیں 24 گھنٹے بعد خودکار طور پر حذف ہو جاتی ہیں۔ یہ privacy اور security کے لیے ہے۔

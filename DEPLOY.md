# 🚀 Deployment Guide - Premium PDF Toolkit

Aapka project do hisson mein deploy hoga taake LibreOffice sahi tarah kaam kar sake.

## 1. Backend Deployment (Render.com or Railway.app)
LibreOffice ki wajah se hum backend ko **Docker** ke zariye deploy karenge.

### Render.com Setup:
1. Render par "New Web Service" select karein.
2. Apna GitHub repository connect karein.
3. **Root Directory:** `backend` select karein.
4. **Environment:** `Docker` select karein (Render khud `Dockerfile` detect kar lega).
5. **Environment Variables** add karein:
   - `PORT`: `5000`
   - `CLOUDINARY_CLOUD_NAME`: (Aapki Detail)
   - `CLOUDINARY_API_KEY`: (Aapki Detail)
   - `CLOUDINARY_API_SECRET`: (Aapki Detail)
   - `MONGODB_URI`: (Aapki Detail)

---

## 2. Frontend Deployment (Vercel)
Vercel par sirf frontend deploy hoga.

### Vercel Setup:
1. Vercel par "New Project" karein.
2. GitHub repository connect karein.
3. **Root Directory:** `frontend` select karein.
4. **Environment Variables** add karein:
   - `NEXT_PUBLIC_API_URL`: (Backend ka URL jo Render se milega, e.g., `https://your-pdf-backend.onrender.com/api`)
5. Deploy par click karein.

---

## 🛠️ Monorepo Structure
Aapka project monorepo hai, isliye deployment ke waqt folders ka sahi intekhab (selection) zaroori hai:
- `/backend` -> Docker (Cloud API)
- `/frontend` -> Vercel (Next.js)

### Kyun?
- **Vercel** par software (LibreOffice) install nahi hota, isliye wahan sirf UI rakhenge.
- **Render/Railway** par hum poora Linux system (Docker) chala sakte hain jis mein hamara naya "Premium Formatting" engine (LibreOffice) fit baithta hai.

# Premium PDF Toolkit

A production-ready PDF manipulation toolkit built with Next.js 14, Node.js, and Cloudinary.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Zustand, Lucide React
- **Backend**: Node.js, Express, TypeScript, Multer, Cloudinary SDK, pdf-lib
- **Database**: MongoDB (Mongoose) for file metadata management

## Features

### ✅ Core PDF Operations
- **Merge PDF** - Combine multiple PDFs into one document
- **Split PDF** - Extract pages or split into multiple files
- **Compress PDF** - Reduce file size while keeping quality
- **Rotate PDF** - Turn PDF pages exactly how you need
- **Delete Pages** - Remove unwanted pages from PDF

### ✨ Advanced Features
- **Watermark** - Add customizable text watermarks with opacity control
- **Signature** - Add text-based signatures with position control
- **PDF to Word** - Convert PDF documents to editable DOCX format
- **Word to PDF** - Convert Word documents to PDF format

### 🔒 Security & Storage
- Secure Cloud Storage processing via Cloudinary
- 24-hour auto-expiration for processed files
- No permanent data storage
- Privacy-focused design

## Prerequisites
- Node.js installed
- MongoDB URI
- Cloudinary Account (Cloud Name, API Key, API Secret)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` folder: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` file with your credentials.
4. Run in development mode: `npm run dev`

### 2. Frontend Setup
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment variables if necessary (default: `http://localhost:5000/api`).
4. Run in development mode: `npm run dev`

## Design Aesthetics
- Dark Mode default
- Glassmorphic UI elements
- Premium Cyan & Purple gradients
- Smooth Framer Motion transitions
- Collapsible sidebar for enhanced productivity

## Security
- Files are stored temporarily on Cloudinary.
- MongoDB TTL indexing automatically removes metadata after 24 hours.
- Direct-to-stream processing where possible to minimize local disk usage.

# Cloudinary Download Issue - Fix Guide

## Problem
When clicking download after merging PDFs, getting HTTP 401 error from Cloudinary URL.

## Root Cause
The issue is that Cloudinary's `secure_url` for raw files might not be directly accessible due to:
1. Account settings (Strict Transformations)
2. Delivery type configuration
3. URL format issues

## Solution Options

### Option 1: Use Signed URLs (Recommended for Production)
Generate signed URLs that are guaranteed to work:

```typescript
const signedUrl = cloudinary.url(result!.public_id, {
  resource_type: 'raw',
  sign_url: true,
  secure: true,
  type: 'upload'
});
```

### Option 2: Check Cloudinary Account Settings
1. Go to Cloudinary Dashboard
2. Settings → Security
3. Disable "Strict Transformations" (if enabled)
4. Ensure "Allowed fetch domains" includes your domain

### Option 3: Use Direct Download URL
Instead of opening in browser, force download:

```typescript
const downloadUrl = `${result!.secure_url}?fl_attachment`;
```

## Current Implementation
The code has been simplified to use direct `secure_url` from Cloudinary.
If still getting 401, we need to:
1. Enable signed URLs
2. Or check Cloudinary account security settings

## Testing
1. Check backend logs for the uploaded URL
2. Try accessing the URL directly in browser
3. If 401, check Cloudinary dashboard settings

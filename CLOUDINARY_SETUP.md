# Cloudinary Setup Guide

## 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

## 2. Get Your Cloud Name

1. Go to Dashboard
2. Copy your **Cloud name** (it's at the top of the dashboard)
3. Example: `mai-ke-kai` or `dxyz123abc`

## 3. Create Upload Preset (Important!)

An upload preset is required for client-side uploads.

1. Go to **Settings** (gear icon) → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `mai-ke-kai-unsigned`
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: `mai-ke-kai` (organizes your images)
   - **Transformation**: Optional, recommended:
     - Mode: Limit
     - Width: 2048
     - Height: 2048
     - Quality: Auto
   - **Allowed formats**: jpg, png, webp
5. Click **Save**

## 4. Get API Credentials (Server-side only)

1. Go to **Settings** → **Access Keys**
2. You'll see:
   - **API Key** (long number)
   - **API Secret** (hidden, click "Reveal" to see it)

## 5. Add Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add these 4 variables:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mai-ke-kai-unsigned
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Example:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=mai-ke-kai
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mai-ke-kai-unsigned
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## 6. Redeploy

After adding the environment variables, **redeploy** your app in Vercel for the changes to take effect.

## 7. Test Upload

1. Go to your admin panel: `https://your-domain.vercel.app/admin/rooms/new`
2. Try uploading an image
3. The image should appear in your Cloudinary dashboard under the `mai-ke-kai` folder

## Troubleshooting

### "Cloudinary not configured" error
- Make sure all 4 environment variables are set in Vercel
- Check that the variable names are EXACT (case-sensitive)
- Redeploy after adding variables

### "Upload preset not found" error
- Make sure the upload preset exists and is set to **Unsigned**
- The preset name must match `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### "Invalid signature" error
- Your API Secret might be wrong
- Regenerate API credentials in Cloudinary and update Vercel

### Images not appearing
- Check browser console for errors
- Verify the Cloudinary URL is correct
- Make sure images are in the `mai-ke-kai` folder

## Free Plan Limits

Cloudinary free plan includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for most surf house operations.

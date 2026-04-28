# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Cloudinary Setup (for Image/PDF Uploads)

This application uses Cloudinary for managing media uploads. To enable this functionality, you need to configure your Cloudinary credentials.

1.  **Create a free Cloudinary account** if you don't have one.
2.  On your Cloudinary dashboard, find your **Cloud Name**, **API Key**, and **API Secret**.
3.  Copy these values into the `.env` file in the root of this project.

Your `.env` file should look like this:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Important**: After updating the `.env` file, you must **restart your development server** for the changes to take effect.

'use server';
import cloudinary from '@/lib/cloudinary';

type SignatureResponse = {
    timestamp: number;
    signature: string;
    error?: string;
}

export async function getCloudinarySignatureAction(folder: string): Promise<SignatureResponse> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    return { timestamp, signature };
  } catch (error: any) {
      return {
          timestamp: 0,
          signature: '',
          error: "Failed to generate signature"
      }
  }
}

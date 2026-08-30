import { supabase } from "../lib/supabaseClient";

export class StorageService {
  public static readonly BUCKET_NAME = "system-images";

  /**
   * Compresses an image file before upload
   */
  static compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.82): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                resolve({ blob: file, dataUrl });
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image file"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads an avatar image to Supabase Storage and automatically removes previous uploads
   */
  static async uploadProfilePhoto(userId: string, file: File, previousPhotoUrl?: string): Promise<string> {
    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");

    // 1. Delete previous photo if URL is provided
    if (previousPhotoUrl) {
      try {
        await this.deleteProfilePhoto(previousPhotoUrl);
      } catch (delErr) {
        console.warn("Could not delete previous photo by URL:", delErr);
      }
    }

    // 2. Also search and delete any older files matching this user's ID in the avatars folder
    try {
      const { data: fileList } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list("avatars", { search: cleanUserId });

      if (fileList && fileList.length > 0) {
        const filesToRemove = fileList
          .filter((f) => f.name.startsWith(`${cleanUserId}_`))
          .map((f) => `avatars/${f.name}`);

        if (filesToRemove.length > 0) {
          await supabase.storage.from(this.BUCKET_NAME).remove(filesToRemove);
        }
      }
    } catch (cleanErr) {
      console.warn("Storage directory cleanup notice:", cleanErr);
    }

    // 3. Compress and upload new photo
    try {
      const { blob, dataUrl } = await this.compressImage(file);
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `avatars/${cleanUserId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }
      }

      console.warn("Supabase storage bucket upload notice:", error?.message || "Using compressed data URL fallback");
      return dataUrl;
    } catch (err: any) {
      console.warn("Storage upload fallback:", err);
      const { dataUrl } = await this.compressImage(file);
      return dataUrl;
    }
  }

  /**
   * Deletes a profile photo from Supabase Storage
   */
  static async deleteProfilePhoto(photoUrl: string): Promise<void> {
    try {
      if (!photoUrl || photoUrl.startsWith("data:")) return;

      const urlWithoutParams = photoUrl.split("?")[0];
      const urlParts = urlWithoutParams.split(`${this.BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
      }
    } catch (err) {
      console.warn("Supabase storage delete notice:", err);
    }
  }
}

import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExt = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9\-]/g, "_");
    const uniqueName =
      Math.random().toString(36).substring(2, 8) +
      "-" +
      Date.now() +
      "-" +
      fileNameWithoutExt;
    const folder = extension === "pdf" ? "documents" : "images";
    return {
      folder: `sheba-point/${folder}`,
      public_id: `sheba-point/${folder}/${uniqueName}`,
      resource_type: extension === "pdf" ? "raw" : "image",
    };
  },
});
export const multerUpload = multer({ storage });

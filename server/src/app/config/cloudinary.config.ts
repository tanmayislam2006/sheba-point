import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import AppError from "../shared/appError";
import status from "http-status";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});
export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.BAD_REQUEST,
      "Buffer and fileName are required to upload to Cloudinary",
    );
  }
  const extension = fileName.split(".").pop()?.toLocaleLowerCase();
  const fileNameWithoutExt = fileName
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
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: extension === "pdf" ? "raw" : "image",
          public_id: `sheba-point/${folder}/${uniqueName}`,
          folder: `sheba-point/${folder}`,
        },
        (error, result) => {
          if (error) {
            reject(
              new AppError(
                status.INTERNAL_SERVER_ERROR,
                "Failed to upload file to Cloudinary",
              ),
            );
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      )
      .end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);

    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      console.log(
        `File with public ID ${publicId} deleted successfully from Cloudinary.`,
      );
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to delete file from Cloudinary",
    );
  }
};
export const cloudinaryUpload = cloudinary;

import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (req: Request) => {
    try {
        const filesToDelete = new Set<string>();

        if(req.file && req.file?.path){
            filesToDelete.add(req.file.path);
        }

        if(req.files && typeof req.files === 'object' && !Array.isArray(req.files)){
            // [ [{path : "rfrf"}] , [{}, {}]]
            Object.values(req.files).forEach(fileArray =>{
                if(Array.isArray(fileArray)){
                    fileArray.forEach(file => {
                        if(file.path){
                            filesToDelete.add(file.path);
                        }
                    })
                }
            })
        }

        if(req.files && Array.isArray(req.files) && req.files.length > 0){
            req.files.forEach(file => {
                if(file.path){
                    filesToDelete.add(file.path);
                }
            })
        }

        const urls = Array.from(filesToDelete);
        if(urls.length > 0){

            const results = await Promise.allSettled(
                urls.map(url => deleteFileFromCloudinary(url))
            );
            const failedCount = results.filter((result) => result.status === "rejected").length;
            const successCount = urls.length - failedCount;
            console.log(`Deleted ${successCount}/${urls.length} uploaded file(s) from Cloudinary due to an error during request processing.`);
        }
        
    } catch (error) {
        console.error("Error deleting uploaded files from Global Error Handler", error);
        
    }
}

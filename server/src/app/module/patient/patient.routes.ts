import { Router } from "express";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { patientValidation } from "./patient.validation";
import { patientController } from "./patient.controller";
import { parseMultipartJsonData } from "../../middleware/parseMultipartJsonData";

const router=Router()
router.patch("/update-my-profile",
    authGaud(Role.PATIENT),
    multerUpload.fields([
        { name : "profilePhoto", maxCount : 1},
        { name : "medicalReports", maxCount : 5}
    ]),
    parseMultipartJsonData,
    updateMyPatientProfileMiddleware,
    validateRequest(patientValidation.updatePatientProfileZodSchema),
    patientController.updateMyProfile
)
export const patientRoutes=router

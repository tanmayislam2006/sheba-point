import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();
router.post("/create-specialty", specialtyController.createSpecialty);
router.get("/get-all-specialties", specialtyController.getAllSpecialties);
router.get("/get-specialty-by-id/:id", specialtyController.getSpecialtyById);
router.put("/update-specialty/:id", specialtyController.updateSpecialty);
router.delete("/delete-specialty/:id", specialtyController.deleteSpecialty);
export const specialtyRoute = router;

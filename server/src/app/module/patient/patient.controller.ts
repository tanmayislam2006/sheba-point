import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../admin/admin.interface";
import { patientService } from "./patient.service";

const updateMyProfile=catchAsync(async(req,res)=>{
    const user = req.user as IRequestUser
    const payload = req.body
    const result = await patientService.updateMyProfile(user,payload)
    sendResponse(res,{
        statusCode:status.OK,
        success:true,
        message:"Profile Updated Successfully",
        data:result
    })
})
export const patientController = {
    updateMyProfile
}
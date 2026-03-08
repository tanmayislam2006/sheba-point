import { httpClient } from "@/lib/axios/httpClient"

export const getDoctors=async()=>{
    const doctor=await httpClient.get('/doctor')
    console.log(doctor,"FORM ACTION");
    return doctor
}
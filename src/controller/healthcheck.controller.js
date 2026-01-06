import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/asyn-handler.js";
/*
const healthCheck = (req, res)=>{
    try {
        res.status(200).json(new ApiResponse(200, {"message": "healthcheck is success"}))
    } catch (error) {
        
    }
}*/

//writing try catch using async await to handle error

const healthCheck = asyncHandler(async (req,res)=>{
    res.status(200)
    .json(new ApiResponse(200, {"message": "healthcheck using async run succesfully"}))
})


export { healthCheck }
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"



const verifyJWT=asyncHandler(async (req,res)=>{

    const accessToken=req.cookies.accessToken || req.header("Authorization").replace("Bearer ","");
    const refreshToken=req.cookies.refreshToken || req.header("Authorization").replace("Bearer ","");

    const decodedToken=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);


})
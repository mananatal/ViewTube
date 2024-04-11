import {User} from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import  { ApiError } from "../utils/ApiError.js";
import  { ApiResponse } from "../utils/ApiResponse.js"
import {uploadToCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose ,{Schema} from "mongoose";


const options={
    httpOnly:true,
    secure:true,
}



const generateAccessAndRefreshToken=async (userId)=>{
    try{
        const user =await User.findById(userId);
        const refreshToken=user.generateRefreshToken();
        console.log("PRINTING USER: ",refreshToken)
        const accessToken=user.generateAccessToken();
        
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};       

    }
    catch(error){        
        throw new ApiError(500,"Error while generating access and refresh token");
    }
}


const registerUser=asyncHandler(async (req,res)=>{
    //importing file from req body
    const {password,fullName,email,username}=req.body;
    //importing image file 
    const avatarLocalPath=req.files?.avatar[0].path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files?.coverImage[0].path;
    }

    //validation checks
    if([password,fullName,email,username,avatarLocalPath].some((field)=>field.trim==="")){
        throw new ApiError(400,"All fields are required");
    }

    //checking if user already registers
    const existedUser=await User.findOne({$or:[{email},{username}]});

    if(existedUser){
        throw new ApiError(409,"User already registered,please Log In");
    }

    //uploading image to cloudinary
    const avatar=await uploadToCloudinary(avatarLocalPath);
    const coverImage=await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Error occured while uploading Avatar to cloudinary");
    }

    //now registering user
    const userCreated=await User.create({
        username:username.toLowerCase(),
        password,
        email,
        fullName,
        avatar:avatar.secure_url,
        coverImage:coverImage?.secure_url||""
    });

    const createdUser=await User.findById(userCreated._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )    

});


const loginUser=asyncHandler(async (req,res)=>{
    //fetching data
    const {userName,email,password}=req.body;

    //validating Data
    if(!(userName || email) || !password){
        throw new ApiError(400,"Some fields are missing ");
    }

    //finding user in DB
    const existedUser=await User.findOne({$or:[{email},{userName}]});

    if(!existedUser){
        throw new ApiError(404,"User not found, Please create an account first");
    }

    //If user exists then comparing password with db password
    const isPasswordCorrect= existedUser.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Please Enter correct password");
    }
    
    //generating access and refresh token
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(existedUser._id);

    //removing existedUser password and refresh token
    existedUser.password=undefined;
    existedUser.accessToken=undefined;

    //now sending successful response and setting cookies
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            201,
            {
                loggedInUser:existedUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    );
});


const logoutUser=asyncHandler(async (req,res)=>{
    //removing refreshToken from User in db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    );

    //returning response 
    return res.status(200)
           .clearCookie("refreshToken",options)
           .clearCookie("accessToken",options)
           .json(
            new ApiResponse(201 ,{},"User Logged Out Successfully")
           )
});

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }

    //if refresh token exist then decode it
    try{
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

        if(!decodedToken){
            throw new ApiError(400,"Invalid Refresh Token");
        }

        //generating new access and refresh token
        const user=await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(400,"User not found for given token");
        }
    
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

        return res.status(200)
               .cookie("accessToken",accessToken,options)
               .cookie("refreshToken",refreshToken,options)
               .json(
                new ApiResponse(200,{refreshToken,accessToken},"Access Token Refreshed Successfully")
               );

    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token")   
    }
});

const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Some fields are missing");
    }

    const user= await User.findById(req.user?._id);

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Old Password is incorrect");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200)
           .json(
                new ApiResponse(200,{},"Password updated successfully")
           );

});

const getUserDetails=asyncHandler(async (req,res)=>{
    if(!req.user){
        throw new ApiError(401,"Unauthorized Access");
    }
    return res.status(200).json(new ApiResponse(200,req.user,"User details fetched successfully"));
});

const updataAccountDetails=asyncHandler(async (req,res)=>{
    
    if(!req.user){
        throw new ApiError(401,"Unauthorized access");
    }
    
    const {fullName,email}=req.body;

    if([fullName,email].some((field)=>field.value.trim==="")){
        throw new ApiError(400,"Some fields are missing, please enter all fields carefully");
    }

    const updatedUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                email,
                fullName
            }
        },
        {new:true}
    );

    return res.status(200).json(
        new ApiResponse(200,{user:updatedUser},"User data updated successfully")
    );
    
});

const updateUserAvatar=asyncHandler(async (req,res)=>{
    if(!req.user){
        throw new ApiError(401,"Unauthorized access");
    }

    const avatar=req.file?.path;
    if(!avatar){
        throw new ApiError(400,"avatar is missing");
    }

    //uploading avatar to cloudinary
    const uploadedAvatar=await uploadToCloudinary(avatar);

    //updating user avatar with new secure url
    const updatedUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:uploadedAvatar.secure_url,
            }
        },
        {new:true}
    );
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{updatedUser},"User Avatar updated successfully")
    );

})

const updateUserCoverImage=asyncHandler(async (req,res)=>{
    if(!req.user){
        throw new ApiError(401,"Unauthorized access");
    }

    const coverImage=req.file?.path;
    if(!coverImage){
        throw new ApiError(400,"coverImage is missing");
    }

    //uploading avatar to cloudinary
    const uploadedCoverImage=await uploadToCloudinary(coverImage);

    //updating user avatar with new secure url
    const updatedUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:uploadedCoverImage.secure_url,
            }
        },
        {new:true}
    );
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{updatedUser},"User Cover image updated successfully")
    );

})

const getUserProfileDetails=asyncHandler(async (req,res)=>{
    const {username}=req.params;

    if(!username.trim()){
        throw new ApiError(400,"Username not found");
    }

    const channel =await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                subscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        },
        {
            $project:{
                username:1,
                avatar:1,
                coverImage:1,
                email:1,
                subscribedToCount:1,
                subscribersCount:1,
                isSubscribed:1,
                fullName:1
            }
        }
    ]);

    if(!channel?.length){
        throw new ApiError(404,"Channel not exist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "Channel details fetched successfuly"
        )
    );
})

const getWatchHistory=asyncHandler(async (req,res)=>{

    if(!req.user?._id){
        throw new ApiError(403,"Unauthorized access");
    }

    const user=await User.aggregate([
        {
            $match:new mongoose.Types.ObjectId(req.user?._id)
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        avatar:1,
                                        username
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },        
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    );
})


export {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserDetails,
    updataAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserProfileDetails,
    getWatchHistory,    
}
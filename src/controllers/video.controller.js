import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"
import { Comment } from "../models/comment.model.js"
import {Playlist} from "../models/playlist.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    const videoFile=req.files?.videoFile[0]?.path;
    const thumbnail=req.files?.thumbnail[0]?.path;

    if(!title || !description){
        throw new ApiError(401,"Some fields are missing");
    }

    if(!videoFile || !thumbnail){
        throw new ApiError(401,"media files missing")
    }

    //uploading thumbnail to cloudinary
    const updatedThumbnail=await uploadOnCloudinary(thumbnail);
    //uploading video file to cloudinary
    const updatedVideoFile=await uploadOnCloudinary(videoFile);

    console.log(updatedVideoFile);

    const publishedVideo=await Video.create({
        title,
        description,
        videoFile:updatedVideoFile?.secure_url,
        thumbnail:updatedThumbnail?.secure_url,
        duration:updatedVideoFile?.duration,
        owner:req.user?._id,
    });

    if(!publishedVideo){
        throw new ApiError(404,"Error while publishing video");
    }

    return res.status(200).json(new ApiResponse(200,publishedVideo,"Video Published Successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400,"VideoId is missing");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid object id")
    }

    const video=await Video.findById(videoId)
                            .populate({
                                path:"owner",
                                select:"username fullName avatar email"
                            });
    
    if(!video){
        throw new ApiError(404,"No video found for give video id");
    }

    return res.status(200).json(new ApiResponse(200,video,"Video details fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description} = req.body;
    let videoFileLocalPath;
    let thumbnailLocalPath;

    if(!videoId){
        throw new ApiError(400,"VideoId is missing");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid video id")
    }

    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length>0){
        videoFileLocalPath=req.files?.videoFile[0]?.path;
    }

    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    }

    const video=await Video.findById(videoId);

    if(video?.owner!=req.user?._id){
        throw new ApiError(401,"Unauthorized Access");
    }

    if(videoFileLocalPath){
        const updatedVideo=await uploadOnCloudinary(videoFileLocalPath);
        video.videoFile=updatedVideo.secure_url;
        video.duration=updatedVideo.duration;
    }
    if(thumbnailLocalPath){
        const updatedThumbnail=await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail=updatedThumbnail.secure_url;
    }

    video.title=title||video.title;
    video.description=description||video.description;

    const updatedVideo=await video.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video updated successfully"));

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"VideoId is missing");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid object id")
    }

    const video=await Video.findById(videoId);

    //delete video thumbnail and videoFile from cloudinary
    const deletedThumbnail=await deleteFromCloudinary(video?.thumbnail);
    if(!deletedThumbnail){
        throw new ApiError(500,"Error while deleting thumbnail from cloudinary");
    }

    const deletedVideoFile=await deleteFromCloudinary(video?.videoFile);
    if(!deletedVideoFile){
        throw new ApiError(500,"Error while deleting videoFile from cloudinary");
    }

    //remove likes and comment on video to be deleted 
    await Like.deleteMany({video:videoId});
    await Comment.deleteMany({video:videoId});

    //pull video from playlist and watchHistoy of user
    await User.updateMany(
        {watchHistory:videoId},
        {
            $pull:{
                watchHistory:videoId
            }
        }
    );

    await Playlist.updateMany(
        {videos:videoId},
        {
            $pull:{
                videos:videoId
            }
        }
    );

    //delete videoinfo from database
    const deletedVideo=await Video.findByIdAndDelete(videoId);

    if(!deletedVideo){
        throw new ApiResponse(500,"Error while deleting video");
    }

    return res.status(200).json(new ApiResponse(200,deletedVideo,"Video deleted Successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(400,"VideoId is missing");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid object id")
    }

    const video=await Video.findById(videoId);

    const toggle=!video.isPublished;
    video.isPublished=toggle;

    const toggledVideo=await video.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,toggledVideo,"video publish status toggled successfully"));

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

import {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadToCloudinary} from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"
import { Comment } from "../models/comment.model.js"
import {Playlist} from "../models/playlist.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
      
      const { page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1,
        userId } = req.query;

    // dont use await because it will be not able to populate properly with aggregate pipeline in the next step 
    const matchCondition = {
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    };

    if (userId) {
        matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }
    var videoAggregate;
    try {
        videoAggregate = Video.aggregate(
            [
                {
                    $match: matchCondition

                },

                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    _id :1,
                                    fullName: 1,
                                    avatar: "$avatar.url",
                                    username: 1,
                                }
                            },

                        ]
                    }

                },

                {
                    $addFields: {
                        owner: {
                            $first: "$owner",
                        },
                    },
                },

                {
                    $sort: {
                        [sortBy || "createdAt"]: sortType || 1
                    }
                },

            ]
        )
    } catch (error) {
        console.error("Error in aggregation:", error);
        throw new ApiError(500, error.message || "Internal server error in video aggregation");
    }

    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    Video.aggregatePaginate(videoAggregate, options)
        .then(result => {
            // console.log("first")
            if (result?.videos?.length === 0 && userId) {
                return res.status(200).json(new ApiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        }).catch(error => {
            console.log("error ::", error)
            throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
        })
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
    const updatedThumbnail=await uploadToCloudinary(thumbnail);
    //uploading video file to cloudinary
    const updatedVideoFile=await uploadToCloudinary(videoFile);

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
    
    if(!videoId.trim()){
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

    if(!video?.owner.equals(req.user?._id)){
        throw new ApiError(401,"Unauthorized Access");
    }

    if(videoFileLocalPath){
        const updatedVideo=await uploadToCloudinary(videoFileLocalPath);
        video.videoFile=updatedVideo.secure_url;
        video.duration=updatedVideo.duration;
    }
    if(thumbnailLocalPath){
        const updatedThumbnail=await uploadToCloudinary(thumbnailLocalPath);
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

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,!videoId?"VideoId is missing":"Invalid object id");
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

import mongoose,{Schema} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    if(!req.user?._id){
        throw new ApiError(401,"Unauthorized Access");
    }

    const SubscribersCount=await Subscription.aggregate([
        {
            $match:{
                channel:new Schema.Types.ObjectId(req.user?._id),
            }
        },
        {
            $count:"totalSubscribers",
        }
    ]);

    const VideosCount=await Video.aggregate([
        {
            $match:{
                owner:new Schema.Types.ObjectId(req.user?._id),
            }
        },
        {
            $count:"totalVideos"
        }
    ]);

    const likesCount=await Video.aggregate([
        {
            $match:{
                owner:new Schema.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likedVideos"
            }
        },
        {
            $addFields:{
                totalLikes:{
                    $size:"$likedVideos"
                }
            }
        }
    ]);

    const viewsCount=await Video.aggregate([
        {
            $match:{
                owner:new Schema.Types.ObjectId(req.user?._id),
            }
        },
        {
            $group:{
                _id:null,
                totalViewsOnAllVideos:{
                    $sum:"$views"
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200,{SubscribersCount,viewsCount,likesCount,VideosCount},"User dashboard details fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    if(!req.user?._id){
        throw new ApiError(401,"Unauthorized Access");
    }

    const userVideos=await Video.find({owner:req.user?._id});

    if(!userVideos.length){
        return res.status(200).json(new ApiResponse(200,{},"User don't upload any videos"));
    }

    return res.status(200).json(new ApiResponse(200,userVideos,"UserVideos Fetched Successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
}
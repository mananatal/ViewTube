import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
   
    const likedvideo=await Like.findOne({video:videoId, likedBy:req.user?._id});

    if(likedTweet){
        //then remove the liked video document from the likes schema
        await Like.deleteOne({video:videoId, likedBy:req.user._id});
        return res.status(200).json(new ApiResponse(200,{},"video unliked successfully"));
    }

    //in !likedvideo then creating new document for like video
    await Like.create({
        likedBy:req.user?._id,
        video:videoId
    });

    return res.status(200).json(new ApiResponse(200,{},"video Liked successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const likedcomment=await Like.findOne({comment:commentId, likedBy:req.user?._id});

    if(likedcomment){
        //then remove the liked comment document from the likes schema
        await Like.deleteOne({comment:commentId, likedBy:req.user._id});
        return res.status(200).json(new ApiResponse(200,{},"comment unliked successfully"));
    }

    //in !likedcomment then creating new document for like comment
    await Like.create({
        likedBy:req.user?._id,
        comment:tweetId
    });

    return res.status(200).json(new ApiResponse(200,{},"comment Liked successfully"));
    
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    const likedTweet=await Like.findOne({tweet:tweetId, likedBy:req.user?._id});

    if(likedTweet){
        //then remove the liked tweet document from the likes schema
        await Like.deleteOne({tweet:tweetId, likedBy:req.user._id});
        return res.status(200).json(new ApiResponse(200,{},"Tweet unliked successfully"));
    }

    //in !likedTweet then creating new document for like video
    await Like.create({
        likedBy:req.user?._id,
        tweet:tweetId
    });

    return res.status(200).json(new ApiResponse(200,{},"Tweet Liked successfully"));

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //to get all liked videos by a user
    const likedVideos=await Like.find({likedBy:req.user?._id , video:{$ne:null}}).populate("video").exec();

    if(!likedVideos){
        return res.status(200).json(new ApiResponse(200,{},"User did not liked any videos"));
    }

    const videoLikedByUser=likedVideos.map((like)=>like.video);

    return res.status(200).json(new ApiResponse(200,{likedVideos:videoLikedByUser},"User liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
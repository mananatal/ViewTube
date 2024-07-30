import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const createTweet = asyncHandler(async (req, res) => {   
    const {content}=req.body;

    if(!content.trim()){
        throw new ApiError(400,"Content is missing");
    }

    const result =await Tweet.create({
        owner:req.user?._id,
        content
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200,result,"Tweet created successfully")
    )
    
})

const getUserTweets = asyncHandler(async (req, res) => {

    const {userId}=req.params;

    if(!userId){
        throw new ApiError(401,'UserId not found');
    }

    const result=await Tweet.find({owner:userId});

    if(!result.length){
        return res.status(200).json(new ApiResponse(200,{},"User does not tweet anything"))
    }

    return res.status(200)
    .json(
        new ApiResponse(200,result,"User tweets fetched successfuly")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params;
    const {updatedContent}=req.body;

    if(!tweetId){
        throw new ApiError(401,'tweetId not found');
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:updatedContent
            }
        },
        {new:true}
    );

    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet Updated Successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params;
    console.log("INDISE")
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(401,!tweetId?'tweetId not found':'invalid tweet id');
    }

    //deleting likes on tweet which is to be deleted
    await Like.deleteMany({tweet:tweetId});

    //deleting tweet
    await Tweet.deleteOne({_id:tweetId});

    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted succesfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

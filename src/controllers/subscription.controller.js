import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription}  from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,!channelId?"Channel id is Missing":"Invalid channel Id");
    }
    
    const toggle=await Subscription.findOne({channel:channelId,subscriber:req.user?._id});

    if(toggle){
        await Subscription.deleteOne({channel:channelId,subscriber:req.user?._id});
        return res.status(200).json(new ApiResponse(200,{},"Channel Unsubscribed Successfully"));
    }
    
    const createdSubscription=await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId,
    });
    // toggle.subscriber=req.user?._id;
    // toggle.channel=channelId;

    // console.log("Printing toggle",toggle)
    // await toggle.save();
    
    return res.status(200).json(new ApiResponse(200,createdSubscription,"Channel subscribed Successfully"));

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,!channelId?"Channel id is Missing":"Invalid channel Id");
    }

    const channelSubscribers=await Subscription.find({channel:channelId})
                                    .populate({
                                        path:"subscriber",
                                        select:"username fullName avatar email"
                                    })
                                    .exec(); 

    if(!channelSubscribers.length){
        return res.status(200).json(new ApiResponse(200,{},"Channel does not have any subscribers"));
    }

    return res.status(200).json(new ApiResponse(200,channelSubscribers,"Channel subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400,!subscriberId?"subscriber id is Missing":"Invalid subscriber Id");
    }

    const SubscribedChannels=await Subscription.find({subscriber:subscriberId})
                                    .populate({
                                        path:"channel",
                                        select:"username fullName avatar email"
                                    })
                                    .exec(); 

    if(!SubscribedChannels.length){
        return res.status(200).json(new ApiResponse(200,{},"User does not Subscribed to any channels"));
    }

    return res.status(200).json(new ApiResponse(200,SubscribedChannels,"subscribed channel fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
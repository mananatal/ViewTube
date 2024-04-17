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

    toggle.subscriber=req.user?._id;
    toggle.channel=channelId;

    await toggle.save();
    
    return res.status(200).json(new ApiResponse(200,toggle,"Channel subscribed Successfully"));

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
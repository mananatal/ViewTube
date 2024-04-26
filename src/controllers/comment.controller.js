import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Like} from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || !page || !limit){
        throw new ApiError(400,"Some fields are missing");
    }

    const options={
        page,
        limit
    }

    let videoComments=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId) 
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"userDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            email:1,
                            avatar:1,                            
                        }
                    },
                    {
                        $addFields:{
                            userDetails:{
                                $first:"$userDetails"
                            }
                        }
                    }
                ]
            },            
        },
        {
            $project:{
                content:1,
                userDetails:1,                
            }
        }
    ]);

    await Comment.aggregatePaginate(videoComments,options)
    .then((results)=>{
        return res.status(200).json(new ApiResponse(200,results,"Video Comments fetched successfully"));
    })
    .catch((error)=>{
        throw new ApiError(500,`OOPS! ${error?.message}`);
    })


})

const addComment = asyncHandler(async (req, res) => {   
    const {videoId}=req.params;
    const {content}=req.body;

    if(!content.trim() || !videoId){
        throw new ApiError(400,"Some fields are missing");
    }

    const comment=await Comment.create({
        video:videoId,
        content,
        owner:req.user?._id
    });

    return res.status(200).json(new ApiResponse(200,comment,"Comment created successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params;
    const {content}=req.body;

    if(!content || !commentId){
        throw new ApiError(400,"Some fields are missing");
    }

    const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new:true}
    );

    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params;

    if(!commentId){
        throw new ApiError(400,"comment id is missing");
    }

    //deleting likes on comment which is to be deleted 
    await Like.deleteMany({comment:commentId});

    //deleting comment
    const deletedComment=await Comment.deleteOne({_id:commentId});

    return res.status(200).json(new ApiResponse(200,deleteComment,"Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}

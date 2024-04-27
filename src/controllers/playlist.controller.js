import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !description){
        throw new ApiError(400,"Some fields are missing");
    }


    //creating playlist
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user?._id
    });

    if(!playlist){
        throw new ApiError("500","Error while Creating playlist");
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"));
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400,"userId is required");
    }

    const userPlaylists=await Playlist.find({owner:userId})
                                    .populate({
                                        path:"owner",
                                        select:"username avatar fullName"
                                    })
                                    .populate("videos");
    
    if(!userPlaylists.length){
        return res.status(200).json(new ApiResponse(200,{},"No playlist exists for given user"));
    }

    return res.status(200).json(new ApiResponse(200,userPlaylists,"User Playlists fetched successfully"));
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400,"Playlist id is missing");
    }

    const playlist=await Playlist.findById(playlistId)
                                    .populate({
                                        path:"owner",
                                        select:"username avatar fullName"
                                    })
                                    .populate("videos");

    if(!playlist){
        throw new ApiError(404,"No playlist exist for given id");
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"));
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!videoId || !playlistId){
        throw new ApiError(400,"Some fields are missing");
    }

    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found with given id");
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already present in playlist");
    }
    
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"please enter valid video id")
    }



    // const existedVideoInPlaylist=await 

    const updatedPlaylist=await Playlist.findOneAndUpdate(
        {_id:playlistId},
        {
            $push:{
                videos:video?._id,
            }
        },
        {new:true},
    );

    console.log("PRINTING UPDATED PLAYLIST: ",updatedPlaylist)

    if(!updatedPlaylist){
        throw new ApiError(500,"Error while adding video to playlist");
    }

    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video successfully added to playlist"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!videoId || !playlistId){
        throw new ApiError(400,"Some fields are missing");
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId,
            }
        },
        {new:true}
    );

    if(!updatedPlaylist){
        throw new ApiError(500,"Error while Removing video from playlist");
    }

    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video successfully removed from playlist"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400,"Playlist id is missing");
    }

    const deletedPlaylist= await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist){
        throw new ApiError(500,"Error while deleting playlist");
    }

    return res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!name || !description || !playlistId){
        throw new ApiError(400,"Some fields are missing");
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    );

    if(!updatedPlaylist){
        throw new ApiError(500,"Error while Removing video from playlist");
    }
    
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"successfully updated the playlist"));

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

import mongoose from "mongoose";

const playlistSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    videos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },

},{timestamps:true});

export const Playlist=mongoose.model("Playlist",playlistSchema);
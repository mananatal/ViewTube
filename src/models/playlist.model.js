import mongoose from "mongoose";

const playlistSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    videos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    name:{
        type:String,
        require:true,
        trim:true
    },
    description:{
        type:String,
        require:true,
        trim:true
    },

},{timestamps:true});

module.exports=mongoose.model("Playlist",playlistSchema);
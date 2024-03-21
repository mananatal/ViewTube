import mongoose from "mongoose";

const commentSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        require:true,
    },
    content:{
        type:String,
        require:true,
        trim:true
    }
},{timestamps:true});

module.exports=mongoose.model("Comment",commentSchema);
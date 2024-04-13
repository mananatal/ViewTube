import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    content:{
        type:String,
        require:true,
        trim:true
    },    

},{timestamps:true});

export const Tweet=mongoose.model("Tweet",tweetSchema);
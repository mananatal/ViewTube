import mongoose, { mongo } from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase: true,
        trim: true, 
        index: true
    },
    email:{
        type:String,
        require:true,
        lowercase: true,
        trim: true,         
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true,         
    },
    avatar:{
        type:String,
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true,"Password is Required"],
    },
    refreshToken:{
        type:String,

    }

},{timestamps:true});

module.exports=mongoose.model("User",userSchema);
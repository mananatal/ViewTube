import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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

userSchema.pre("save",async function(next){

    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
   const payLoad={
     _id:this._id,
     username:this.username,
     email:this.email,
     fullName:this.fullName
   }
   
   return jwt.sign(payLoad,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRE_TIME});
}

userSchema.methods.generateRefreshToken=function(){
    const payLoad={
      _id:this._id,      
    }
    console.log("Printing Payload of access token: ",payLoad)
    return jwt.sign(payLoad,process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRE_TIME});
 }


export const User=mongoose.model("User",userSchema);
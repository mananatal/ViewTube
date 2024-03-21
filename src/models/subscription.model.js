import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
},{timestamps:true});

module.exports=mongoose.model("Subscription",subscriptionSchema);
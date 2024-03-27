import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new mongoose.Schema({
    videoFile:{
        type:String,
        require:true,
    },
    thumbnail:{
        type:String,
        require:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    title:{
        type:String,
        require:true,
        trim:true
    },
    description:{
        type:String,
        require:true,
        trim:true
    },
    duration:{
        type:Number,
        require:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true        
    }

},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);

module.exports=mongoose.model("Video",videoSchema);
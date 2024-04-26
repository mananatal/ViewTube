import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});

const uploadToCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;

        const response=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"});

        fs.unlinkSync(localFilePath);

        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath);

        return null;
    }
}

const deleteFromCloudinary=async (publicUrl)=>{
    try{
        if(!publicUrl) return null;

        const response=await cloudinary.uploader.destroy(publicUrl);

        return response;

    }catch(error){
        console.log("Error while deleting uploaded file from cloudinary: ",error.message);
    }
}

export {uploadToCloudinary,deleteFromCloudinary}
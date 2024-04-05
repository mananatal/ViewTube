import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,updataAccountDetails,getUserDetails,updateUserAvatar,updateUserCoverImage} from "../controllers/auth.controller.js"

const router=Router();

router.post("/register",upload.fields([{name:"avatar", maxCount:1},{name:"coverImage", maxCount:1}]),registerUser);

router.post("/login",loginUser);
router.post("/logout",verifyJWT,logoutUser);
router.post("/refresh-token",refreshAccessToken);
router.post("/change-password",verifyJWT,changeCurrentPassword);
router.patch('/update-profile',verifyJWT,updataAccountDetails);
router.patch("/update-avatar",verifyJWT,updateUserAvatar);
router.patch("/update-cover-image",verifyJWT,updateUserCoverImage);
router.get("/current-user",verifyJWT,getUserDetails);


export default router;
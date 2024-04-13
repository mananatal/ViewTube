import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {createTweet,deleteTweet,getUserTweets,updateTweet} from "../controllers/tweet.controller.js"

const router=Router();

// Apply verifyJWT middleware to all routes in this file 
router.use(verifyJWT);

router.route("/createTweet").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
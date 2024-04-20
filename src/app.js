import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app=express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credentials:true
}));
app.use(express.json({limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit: "20kb"}));

//importing router
import userRouter from "./routes/user.route.js";
import tweetRouter from "./routes/tweet.route.js";
import likeRouter from "./routes/like.route.js";
import commentRouter from "./routes/comment.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import healthcheckRouter from "./routes/healthCheck.route.js"
import videoRouter from "./routes/video.route.js"


//declaring routes
app.use("/api/v1/auth",userRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/videos", videoRouter)


export {app}

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

//declaring routes
app.use("/api/v1/auth",userRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/likes", likeRouter);


export {app}

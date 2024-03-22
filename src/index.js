import { dbConnect } from "./db/dbConnect.js";
import {app} from "./app.js";
import dotenv from "dotenv";
dotenv.config()

const PORT=process.env.PORT || 4000;

dbConnect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is up and running at PORT: ",PORT);
    })
})
.catch((error)=>console.error("OOPS! ERROR WHILE CONNECTING TO MONGODB ",error));
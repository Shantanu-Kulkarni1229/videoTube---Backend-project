import dotenv from "dotenv"
import {app} from  './app.js';
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})
const PORT = process.env.PORT || 8001

connectDB()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server is running on port no. ${PORT}`); 
    })
})
.catch((err)=>{
    console.log("MongoDB connection error", err);
    
})
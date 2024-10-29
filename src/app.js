import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import{ errorHandler} from "./middlewares/error.middlewares.js"
const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)
// common middlewarews
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))



// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js"
import { healthcheck } from "./controllers/healthcheck.controllers.js"
import userRouter from "./routes/user.routes.js"

//routes

app.use("/api/v1/healthcheck" , healthcheckRouter)
app.use("/api/v1/users" , userRouter)
// app.use(errorHandler)


export{app}
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()



// basic config of express app
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(cookieParser())

//cors config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
//importing routes
import  healthCheckRouter  from './routes/healthcheck.route.js'
import authRouter from "./routes/authUser.route.js"
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)

///api/v1/healthcheck is also known as home route

app.get("/", (req, res)=>{
    res.send("Welcome to project manager")

})

export default app;
import express from 'express'
import cors from 'cors'
const app = express()



// basic config of express app
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

//cors config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

import  healthCheckRouter  from './routes/healthcheck.route.js'

app.use("/api/v1/healthcheck", healthCheckRouter)

///api/v1/healthcheck is also known as home route

app.get("/", (req, res)=>{
    res.send("Welcome to project manager")

})

export default app;
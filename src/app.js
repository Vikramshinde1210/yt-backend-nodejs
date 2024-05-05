import express from 'express'
import cors from 'cors'
import cookieParser from 'cookies-parser'


const app  = express()

app.use(express.json({
    limit: "16kb"
})) // middleware- configuration setting
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) 
// cross origin resource sharing
// also allows white listing

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// app.use(cookieParser())

app.use(express.static("public")) // to serve static assets

export { app }
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

// routes import

import userRouter from './routes/user.route.js'

// routes declaration
app.use("/api/v1/users/",userRouter)

// Error middleware to handle erros thrown using next()
app.use((err, req, res, next) => {
    // Log the error (you can customize this part)
    console.error(err.stack);
    // Respond with an appropriate error message
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Error From Server' });
});


export { app }
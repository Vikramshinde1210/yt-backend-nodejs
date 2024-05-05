// index.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_NAME } from './constant.js';
import connectDB from './db/db.js';
import { app } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;


/*
// always use try/catch and async/await when connecting to the db
(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);

        // Handle MongoDB connection error
        mongoose.connection.on("error", (error) => {
            console.log("Not able to connect to the db ", error);
        });

        console.log(`Connected to ${DB_NAME} successfully`);

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server started listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error: ", error);
    }
})();

*/

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started listening on port ${PORT}`);
    });
}).catch((err) => {
    console.log("MongoDB connection Failed",err)
}) 

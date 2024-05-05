import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


// db is in another continent
const  connectDB = async ()  => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb Connected DB HOST ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB Connection Error ", error)
        process.exit(1) //if fails
    }
}

export default connectDB;
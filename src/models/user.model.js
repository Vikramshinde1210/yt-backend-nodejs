import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema =new mongoose.Schema({
    videos: [{
        type: String
    }],
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {  // cloudinary URL
        type: String,
        required: true
    },
    coverImage: {  
        type: String,
        required: true
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken : {
        type: String
    }

}, {timestamps: true})


userSchema.pre("save", async function (next) { // hooks
    if(!this.isModified("password")) next() // check if password field is changed or not if not return from here
    this.password = await bcrypt.hash(this.password, 10)
    next();
} )

userSchema.methods.isPasswordCorrect = async function( password ) { // custom method on model
    return await bcrypt.compare(password, this.password)
}

// jwt token is bearer token - means anyone who has token can get access to the resources

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.genarateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)
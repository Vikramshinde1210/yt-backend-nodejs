import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if(!content) throw new ApiError(400, "Missing required fields");

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet) throw new ApiError(400, "Unable to create tweet");

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created succesfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if(isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

    const userTweets = await Tweet.findById({owner: userId})

    if(!userTweets) throw new ApiError(400, "Unable to fetch user tweets");

    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweet fetched succesfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if(isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

    const result = Tweet.findByIdAndUpdate(
        { _id: tweetId, owner: user },
        { $set: { content: content } }
    )

    if (!result) {
      throw new ApiError(400, "Cannot modify others' tweet or tweet not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, result, "tweet updated successfull"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if(isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

    const result = Tweet.findByIdAndDelete({
        _id: tweetId,
        owner: userId,
    })

    if (!result) {
      throw new ApiError(400, "Cannot delete others' tweet or tweet not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, result, "Commented tweet successfull"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
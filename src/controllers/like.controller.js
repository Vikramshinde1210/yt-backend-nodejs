import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const isVideoIdValid = await Video.findById(videoId);
    if (!isVideoIdValid) {
      throw new ApiError(404, "Video not found");
    }
    const like = await Like.findOne({ likedBy: req.user?._id, video: videoId });
    if (!like) {
      const newLike = await Like.create({ video: videoId, likedBy: userId });
      return res
        .status(200)
        .json(new ApiResponse(201, newLike, "Liked successfully"));
    } else {
      const removeLike = await Like.findOneAndDelete({ likedBy: req.user?._id, video: videoId });
      return res
        .status(200)
        .json(new ApiResponse(201, removeLike, "Removed like successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const isCommentIdValid = await Comment.findById(commentId);
    if (!isCommentIdValid) {
      throw new ApiError(404, "Comment not found");
    }
    const like = await Like.findOne({ likedBy: req.user?._id, comment: commentId  });
    if (!like) {
      const newLike = await Like.create({ comment: commentId , likedBy: userId });
      return res
        .status(200)
        .json(new ApiResponse(201, newLike, "Liked successfully"));
    } else {
      const removeLike = await Like.findOneAndDelete({ likedBy: req.user?._id, comment: commentId  });
      return res
        .status(200)
        .json(new ApiResponse(201, removeLike, "Removed like successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const isTweetIdValid = await Tweet.findById(tweetId);
    if (!isTweetIdValid) {
      throw new ApiError(404, "Comment not found");
    }
    const like = await Like.findOne({ likedBy: req.user?._id, tweet: tweetId  });
    if (!like) {
      const newLike = await Like.create({ tweet: tweetId  , likedBy: userId });
      return res
        .status(200)
        .json(new ApiResponse(201, newLike, "Liked successfully"));
    } else {
      const removeLike = await Like.findOneAndDelete({ likedBy: req.user?._id, tweet: tweetId   });
      return res
        .status(200)
        .json(new ApiResponse(201, removeLike, "Removed like successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.find({
      likedBy: userId,
      video: { $ne: null },
    });
    if (!likedVideos) {
      throw new ApiError(404, "No videos found");
    }
    res
    .status(201)
    .json(new ApiResponse(200, likedVideos, "Fetched successfull"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
          docs: 'comments',
          totalDocs: 'totalComments',
          totalPages: 'totalPages',
          page: 'currentPage'
        },
        sort: { createdAt: -1 } // Sort by creation date, most recent first
    };

    const result = await Comment.aggregatePaginate({ videoId }, options);

    if(!result) throw new ApiError(400, "Unable to fetch comments something went wrong");

    res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;

    if(!content) throw new ApiError(400, "Missing required fields");
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

    const comment = Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!comment) throw new ApiError(400, "Unable to add comment something went wrong");

    return res
    .status(201)
    .json(new ApiResponse(200,comment, "Commented added successfull"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body;
    if(!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id");

    const result = Comment.findByIdAndUpdate(
        { _id: commentId, owner: user },
        { $set: { content: content } }
    )

    if (!result) {
      throw new ApiError(400, "Cannot modify others' comment or comment not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, result, "Commented updated successfull"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id");

    const result = Comment.findByIdAndDelete({
        _id: commentId,
        owner: userId,
    })

    if (!result) {
      throw new ApiError(400, "Cannot delete others' comment or comment not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, result, "Commented deleted successfull"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

// https://devuiv2.vercel.app/templates/youtube
// list view and card view
// list view in case of search
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const baseQuery = {};

    if(query){
        baseQuery.$or = [
            {title : {$regex: query, $options: "i"}}, // case insensitive search
            {description: {$regex: query, $options: "i"}}
        ]
    }

    const sortOptions = {};
    if(sortBy){
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1; // ternary operator
    }

    const videos = await Video.aggregatePaginate([
        Video.aggregate([
            {$match: {...baseQuery, owner: userId}},
            {$sort: sortOptions},
            {$skip: (page - 1) * limit},
            {$limit: parseInt(limit)}
        ])
    ])

    return res.status(200).json(
        new ApiResponse(200, videos , "Videos fetched Successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if ([title, description, videoLocalPath, thumbnailLocalPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "video/thumbnail file is required")
    }

    const video = Video.create({
        videoFile: videoFile.secure_url,
        thumbnail: thumbnailFile.secure_url,
        title,
        description,
        duration: (videoFile.duration / 60).toFixed(2),
        owner: userId,
        isPublished: true,
         views: 0  // initialize views count to zero while publishing video, can increment later
    })

    res
    .status(201)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Could not find video");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, result, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    const { title, description} = req.body

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if ([title, description, videoLocalPath, thumbnailLocalPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "video/thumbnail file is required")
    }

    const oldVideoDeleted = await deleteFromCloudinary(video.videoFile)
    const oldthumbnailDeleted = await deleteFromCloudinary(video.thumbnail)

    const updatedVideo = Video.findByIdAndUpdate(
        videoId,
        {
            videoFile: videoFile.secure_url,
            thumbnail: thumbnailFile.secure_url,
            title,
            description,
            duration: (videoFile.duration / 60).toFixed(2),
        }
    )

    res
    .status(201)
    .json(new ApiResponse(200, {updateVideo, "oldVideoDeleted":oldVideoDeleted, "oldthumbnailDeleted":oldthumbnailDeleted}, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Could not find video");
    }

    // delete thumbail & video from cloudinary
    const videoToDelete = await deleteVideoOnCloudinary(video?.videoFile);
    const thumbnailToDelete = await deleteOnCloudinary(video?.thumbnail);

    if(!videoToDelete || !thumbnailToDelete){
        throw new ApiError(400, "Failed to delete video/thumbail from cloudinary retry again");
    }

    const result = Video.findByIdAndDelete(videoId);

    if(!result){
        throw new ApiError(400, "Failed to delete video/thumbail, retry again");
    }

    res
    .status(200)
    .json(new ApiResponse(200, result, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    video.isPublished = !video.isPublished

    const result = await user.save({validateBeforeSave: false})

    if(!result){
        throw new ApiError(400, "Failed to toggle video status");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {"message":`Video status changed to ${video.isPublished}`}, "Video status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
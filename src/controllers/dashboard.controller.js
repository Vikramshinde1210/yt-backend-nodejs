import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;
    // fetch video views 
    let videoViews = await Video.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalVideoViews = videoViews ? videoViews[0]?.totalViews : 0;
    // total subscribers ko count karo
    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });
    // total videos ko count karo
    const totalVideos = await Video.countDocuments({ owner: userId });
    const videos = await Video.find({ owner: userId }, "_id");
    const totalLikes = await Like.countDocuments({
      video: { $in: videos.map((video) => video._id) },
    });

    res
    .status(201)
    .json(new ApiResponse(200, { totalVideoViews, totalSubscribers, totalVideos, totalLikes }, "fetched data"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const user = req.user._id;
    const channelVideos = await Video.find({ owner: user });
    if (!channelVideos) {
      return new ApiError(404, "videos not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, channelVideos, "Fetched Channel Videos Successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
}
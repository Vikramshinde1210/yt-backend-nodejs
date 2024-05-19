import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const newPlaylist = Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user?._id,
    })

    if(!newPlaylist) throw new ApiError(400, "Failed to create playlist, retry again");
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const userPlaylists = Playlist.findById({owner: userId}) // explicitely mention field name as we're not searching using _id field

    if(!userPlaylists){
        throw new ApiError(400, "Unable to fetch users playlist at this moment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists , "Users playlist fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = Playlist.find(playlistId);

    if(!playlist){
        throw new ApiError(400, "Unable to fetch playlist at this moment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist , "Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(isValidObjectId(playlistId) || isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video/playlist id");
    }

    // Using $addToSet to ensure uniqueness in the videos array
    const result = await Playlist.updateOne(
      { _id: playlistId, videos: { $ne: videoId } },
      { $addToSet: { videos: videoId } }
    );

    if(!result){
        throw new ApiError(400, "Unable to add video at this moment, try again");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, null, result?.nModified === 0?"Video already present in given playlist": "Video added to the playlist" ));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(isValidObjectId(playlistId) || isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video/playlist id");
    }

    const result = await Playlist.updateOne(
      { _id: playlistId },
      { $pull: { videos: videoId } }
    );

    if (result.nModified > 0) {
        res.status(200).json(new ApiResponse(400, null, `Successfully removed video ${videoId} from playlist ${playlistId}`));
    } else {
        res.status(404).json(new ApiResponse(400, null, `Video ${videoId} not found in playlist ${playlistId}`));
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id");

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found!");
    }
    return res.status(201).json(new ApiResponse(200, null, "Playlist deleted"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id");

    if(!name || !description) throw new ApiError(400, "Name and description is mandatory");

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { $set: { name, description } },
      { new: true }
    );
    if (!playlist) {
      throw new ApiError(404, "Playlist not found!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
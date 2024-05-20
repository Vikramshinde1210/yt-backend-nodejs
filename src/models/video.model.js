import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { Comment } from "./comment.model.js";
import { Playlist } from "./playlist.model.js";
import { Like } from "./like.model.js";

const videoSchema = new mongoose.Schema({
    videoFile : {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration : {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate) // add mongodb aggregation library as plugin in video schema

videoSchema.post("findOneAndDelete", async function (doc) { // hooks
    if (!doc) {
        console.log('Document not found');
        return;
    }
    
    const videoId = doc._id;
    // console.log("Inside post middleware, videoId:", videoId);

    // Remove the video from playlists
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    );

    // Delete all comments associated with the video
    await Comment.deleteMany({videos: videoId})

    // Remove the video reference from likes
    await Like.updateMany(
        {video: videoId},
        {
            $unset: {
                video: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    // console.log("out of post middleware");
} )

export const Video = mongoose.model("Video", videoSchema)
import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { Comment } from "./comment.model";
import { Playlist } from "./playlist.model";
import { Like } from "./like.model";

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

// middleware to delete all the data related to the video
videoSchema.post('findOneAndDelete', { document: true, query: false }, async function(doc, next) {
    const videoId = doc._id;

    // Remove the video from playlists
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    );

    // Delete all comments associated with the video
    await Comment.deleteMany({videos: videoId})

    // Remove the video reference from likes
    await Like.findByIdAndUpdate(
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

    next();
});

export const Video = mongoose.model("Video", videoSchema)
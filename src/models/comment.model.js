import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    }, {timestamps: true}
)

commentSchema.plugin(mongooseAggregatePaginate)

commentSchema.post('findOneAndDelete', { document: true, query: false }, async function(doc, next) {
    const commentId = doc._id;

    // Remove the comment reference from likes
    await Like.findByIdAndUpdate(
        {comment: commentId},
        {
            $unset: {
                comment: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    next();
});

export const Comment = mongoose.model("Comment", commentSchema)
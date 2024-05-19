import mongoose, {Schema} from "mongoose";
import { Like } from "./like.model.js";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, {timestamps: true}
)

tweetSchema.post('findOneAndDelete', { document: true, query: false }, async function(doc, next) {
    const tweetId = doc._id;

    // Remove the tweet reference from likes
    await Like.findByIdAndUpdate(
        {tweet: tweetId},
        {
            $unset: {
                tweet: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    next();
});

export const Tweet = mongoose.model("Tweet", tweetSchema)
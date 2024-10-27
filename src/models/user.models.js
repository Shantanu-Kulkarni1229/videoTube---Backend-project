/*
id string pk 
username string
email string
full name string
avatar string 
coverImage string
watchHistory ObjectId[] videos 
password string 
refreshToken string
createdAt date 
updatedAT date
*/

import mongoose, { Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema (
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname:{
            type: String,
            required: true,
            index: true,
            trim: true
        },
        avatar:{
            type: String, // cloudnariy url
            required: true

        },
        coverImage:{
            type: String, // cloudnariy url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
                 
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken:{
            type: String
        }
    },
    { timestamps: true }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const User = mongoose.model('User', userSchema);
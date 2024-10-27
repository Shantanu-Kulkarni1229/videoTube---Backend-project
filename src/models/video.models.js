/* 
owner ObjectId users
videoFile string
thumbnail string
title string
description string
duration number
views number
isPublished boolean
createdAt Date
updatedAt Date
*/


import mongoose, { Schema} from "mongoose";

const userSchema = new Schema (
    {
        videoFile:{
            type: String, // CLOUD url
            required: true
        },
        thumbnail:{
            type: String, // CLOUD url
            required: true
        },
        title:{
            type: String, 
            required: true 
        },
        description:{
            type: String, 
            required: true 
        },
        views:{
            type: Number,
            required: true

        },
        duration:{
            type: Number,
            default: 0

        },
        isPublished:{
            type: boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }

    },
    { timestamps: true }
)

export const Video = mongoose.model('Video', userSchema);
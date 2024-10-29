import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from 'fs';

// Function to generate access and refresh tokens
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// User Registration function
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    } catch (uploadError) {
        throw new ApiError(500, "Failed to upload images to Cloudinary");
    }

    // Create user in database
   try {
     const user = await User.create({
         fullname,
         avatar: avatar.url,
         coverImage: coverImage?.url || "",
         email,
         password,
         username: username.toLowerCase(),
     });
 
     const createdUser = await User.findById(user._id).select("-password -refreshToken");
 
     if (!createdUser) {
         throw new ApiError(500, "User registration failed");
     }
 
     return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
   } catch (error) {
    console.log("User creation failed")
    if (avatar){
        await  deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage){
        await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(500, "something went wrong while registering the user and images were deleted");

   }
});

// Dynamic file handler to read files, with ENOENT handling
export const getUserCoverImage = (req, res) => {
    const coverImagePath = req.query.coverImagePath || './public/temp/default-cover-image.png';

    try {
        if (!fs.existsSync(coverImagePath)) {
            console.log('Cover image file not found, handling error gracefully');
            return res.status(404).send({ error: 'Cover image not found' });
        }

        const fileData = fs.readFileSync(coverImagePath);
        res.send(fileData);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send({ error: 'Server error' });
    }
};

// Avatar File Handler
export const getUserAvatarImage = (req, res) => {
    const avatarPath = req.query.avatarPath || './public/temp/default-avatar.png';

    try {
        if (!fs.existsSync(avatarPath)) {
            console.log('Avatar file not found, handling error gracefully');
            return res.status(404).send({ error: 'Avatar image not found' });
        }

        const fileData = fs.readFileSync(avatarPath);
        res.send(fileData);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send({ error: 'Server error' });
    }
};

// Export the registerUser function
export {
    registerUser
};

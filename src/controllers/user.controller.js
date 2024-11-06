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

const loginUser = asyncHandler(async (req, res) => {
// get data from body
const { email , username, password } = req.body;

//validation
if(!email){
    throw new ApiError(400, "Email is required");
}

const user = await User.findOne({
 $or: [{ username }, { email }]
})
if(!user){
    throw new ApiError(400, "User not found");
}   

// validate password

const isPasswordValid = await user.isPasswordCorrect(password);
if(!isPasswordValid){
    throw new ApiError(400, "Incorrect password");   
}

// generate access and refresh tokens
const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
 if(!loggedInUser){
     throw new ApiError(400, "User not found");
 }
 
 const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}

return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
    ))
        
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate( 
        req.user._id,
        {
            $set: {
                refreshToken: undefined,

            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
    return res
        .status(200)
        .clearCookie("accessToken",  options)
        .clearCookie("refreshToken",  options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken;
    
    if(!incomingRefreshToken){
    throw  new ApiError(401, "Refresh token is required");
    }
    try {
     const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
    const user =     await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401, "invalid refresh token");  
    }
        if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        const {accessToken , refreshToken: newRefreshToken}  = await generateAccessAndRefereshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token and refresh token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, "invalid refresh token");
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})
const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


// Export the   functions
export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
};

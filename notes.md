
# ViTube Project Notes

**Date:** 25/10/24  
**Project:** ViTube  
**Purpose:** Backend development course project  

---

### 1) Database Designing

Designing a database is crucial as it sets up the structure for storing, organizing, and accessing data efficiently.
A well-structured database allows for easy scalability, maintainability, and optimized performance.

---

### 2) Initializing the Project

To start the project, initialize it using `npm init`, which creates a `package.json` file with project details.

```bash
npm init
```

### 3) Adding Module Type in `package.json`

Set `"type": "module"` in `package.json` to enable ES module syntax (e.g., `import/export` syntax) in Node.js.

---

### 4) Installing Dev Dependencies

Install `nodemon` and `prettier` as development dependencies to automatically restart the server on changes and format code respectively.

```bash
npm install --save-dev nodemon prettier
```

---

### 5) Prettier Configuration

Create `.prettierrc` file with specific rules for formatting:

```json
{
    "singleQuote": false,
    "bracketsSpacing": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "semi": true
}
```

Add `.prettierignore` file to ignore certain files/directories:

```plaintext
/.vscode
/node_modules
./dist
*.env
.env
.env.*
```

---

### 6) Folder Structure

Organize files and folders for maintainability and clarity.

---

### 7) Installing Packages

Install `express` and `mongoose` for building the server and connecting to MongoDB.

```bash
npm install express mongoose
```

Import `express` in `app.js`. Additionally, install `dotenv` and `cors` for environment configuration and cross-origin requests.

```bash
npm install dotenv
npm install cors
```

---

### 8) MongoDB Atlas and Database Connection

**MongoDB Atlas:** A cloud database service by MongoDB to easily manage databases.  
In `db/index.js`, set up MongoDB connection.

**Database Connection Code:**

```javascript
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
}

export default connectDB;
```

---

### 9) Setting Up `index.js`

Configure `index.js` for environment variables and database connection.

```javascript
import dotenv from "dotenv";
import { app } from './app.js';
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 8001;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`); 
    });
})
.catch((err) => {
    console.log("MongoDB connection error", err);
});
```

---

### 10) `app.js` File Configuration

In `app.js`, import and configure Express and CORS.

```javascript
import express from "express";
import cors from "cors";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

export { app };
```

---

### 11) Utilities

#### Async Handler

Utility to handle asynchronous errors in route handlers.

```javascript
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
    };
}

export { asyncHandler };
```

#### `ApiResponse.js`

Class to standardize API responses.

```javascript
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
```

#### `ApiError.js`

Class to handle API errors.

```javascript
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
```

---

### Summary

- **Database Design:** Lays foundation for data structure.
- **Package Initialization & Modules:** Structure project dependencies and module system.
- **Middleware & Utilities:** Ensure security, error handling, and cleaner responses.

---

**End of Notes**

# Vid Tube App Backend Notes - 27/10

## Health Check Endpoint

### `healthcheck.controllers.js`
This controller handles a simple health check, which can be useful for ensuring the server is running and responsive.

- **Imports**:  
  - `ApiResponse`: A utility function for structuring API responses.
  - `asyncHandler`: A middleware to handle asynchronous errors in Express routes.
  
- **Function - `healthcheck`**:
  - Description: Uses `asyncHandler` to handle errors gracefully.
  - Returns: A JSON response with status `200` and message `"OK"` indicating that the server is healthy.

  ```javascript
  const healthcheck = asyncHandler(async (req, res) => {
      return res
          .status(200)
          .json(new ApiResponse(200, "OK", "Health check passed"));
  });

  export { healthcheck };
  ```

### `healthcheck.routes.js`
Defines routes for the health check.

- **Imports**:
  - `express`: For routing and request handling.
  - `healthcheck`: The controller function for handling health checks.

- **Router Setup**:
  - Defines a `GET` request to the base path (`/api/v1/healthcheck`) to trigger the health check.

  ```javascript
  const router = express.Router();
  router.route("/").get(healthcheck);
  export default router;
  ```

## Express Server Setup

- **Dependencies**:
  - `express`: Handles the server framework.
  - `cors`: Enables cross-origin requests, allowing specified origins.

- **Middleware Configuration**:
  - `cors`: Set with environment variable to restrict allowed origins.
  - `express.json()` and `express.urlencoded()`: Limit payloads to 16kb to prevent overly large requests.
  - `express.static("public")`: Serves static files from the `public` directory.

  ```javascript
  const app = express();
  app.use(cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
  }));
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(express.static("public"));

  import healthcheckRouter from "./routes/healthcheck.routes.js";
  app.use("/api/v1/healthcheck", healthcheckRouter);

  export { app };
  ```

## User Model - `user.models.js`

Defines the user data structure using Mongoose.

- **Schema Fields**:
  - `username`: Unique identifier for each user.
  - `email`: Stores user email, unique for each account.
  - `fullName`: Full name of the user.
  - `avatar`: URL link to the user's profile image.
  - `coverImage`: URL link for a cover image.
  - `watchHistory`: Array referencing video objects.
  - `password`: Hashed password for user authentication.
  - `refreshToken`: Stores token for session management.
  
  ```javascript
  import mongoose, { Schema } from "mongoose";

  const userSchema = new Schema({
      username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      fullname: { type: String, required: true, trim: true },
      avatar: { type: String, required: true },
      coverImage: { type: String },
      watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
      password: { type: String, required: [true, "Password is required"] },
      refreshToken: { type: String }
  }, { timestamps: true });

  export const User = mongoose.model("User", userSchema);
  ```

## Video Model - `video.models.js`

Schema for storing video-related data.

- **Schema Fields**:
  - `videoFile`: URL to the video file (stored in the cloud).
  - `thumbnail`: URL to the video thumbnail image.
  - `title`: Title of the video.
  - `description`: Brief description of the video.
  - `views`: Number of views.
  - `duration`: Duration of the video in seconds.
  - `isPublished`: Boolean flag to indicate if the video is publicly accessible.
  - `owner`: References the User who uploaded the video.
  
  ```javascript
  import mongoose, { Schema } from "mongoose";

  const videoSchema = new Schema({
      videoFile: { type: String, required: true },
      thumbnail: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      views: { type: Number, required: true },
      duration: { type: Number, default: 0 },
      isPublished: { type: Boolean, default: true },
      owner: { type: Schema.Types.ObjectId, ref: "User" }
  }, { timestamps: true });

  export const Video = mongoose.model("Video", videoSchema);
  ```

## Libraries & Plugins Used

- **`mongoose-aggregate-paginate-v2`**: This plugin enables pagination of data during aggregation, allowing efficient handling of large datasets with Mongoose.

  ```javascript
  import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
  ```

# Vid Tube App Backend Notes - 28/10

## Installed Libraries & Functions

### 1. **Mongoose Hooks, Middlewares, and Methods**

- **Hooks**:
  Mongoose provides "pre" and "post" hooks which are middleware functions executed before or after certain operations like save, remove, update, etc. These are essential for performing actions automatically.

- **Middlewares**:
  Mongoose middlewares operate on schema methods to handle tasks such as data validation, transformation, or encryption.
  
- **Methods**:
  Schema methods enable defining custom functions directly within a schema. These functions can be used on any document that follows the schema.

### 2. **Password Encryption - `bcrypt.js`**

`bcrypt.js` is a library for password hashing and comparison, which secures user passwords in the database.

**Installation**:

```bash
npm install bcrypt
```

**Code Explanation**:

- **`userSchema.pre("save", async function(next)...)`**:
  - This hook triggers before a user document is saved. If the password has been modified, it will be hashed with `bcrypt`.
  - **Example**:
  
    ```javascript
    userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    });
    ```

- **Password Comparison Method**:

  ```javascript
  userSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password, this.password);
  };
  ```

### 3. **JWT Tokens - `jsonwebtoken`**

JWT tokens are used for authenticating and authorizing users. They provide a secure method for transferring user data.

**Installation**:

```bash
npm install jsonwebtoken
```

**Code Explanation**:

- **Access Token Method**:
  
  ```javascript
  userSchema.methods.generateAccessToken = function () {
      return jwt.sign({
          _id: this._id,
          email: this.email,
          username: this.username,
          fullname: this.fullname
      }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      });
  };
  ```
  
- **Refresh Token Method**:
  
  ```javascript
  userSchema.methods.generateRefreshToken = function () {
      return jwt.sign({
          _id: this._id
      }, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      });
  };
  ```

### 4. **Cookie Parser**

This middleware is used to parse cookies attached to client requests.

**Installation**:

```bash
npm install cookie-parser
```

### 5. **Multer for File Handling**

`Multer` is a middleware for handling multipart/form-data, mainly used for uploading files.

**Installation**:

```bash
npm install multer
```

**Multer Configuration**:

  ```javascript
  import multer from "multer";

  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, './public/temp');
      },
      filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
      }
  });

  export const upload = multer({ storage: storage });
  ```

### 6. **File System (`fs`) in Express**

The Node `fs` module is used to handle file operations in the server, such as reading, writing, or deleting files.

### 7. **Cloudinary for Image Handling**

Cloudinary is a cloud service that offers secure and optimized media upload and transformation.

**Installation**:

```bash
npm install cloudinary
```

**Cloudinary Configuration & Upload**:

- **Configuring Cloudinary**:

  ```javascript
  import { v2 as cloudinary } from "cloudinary";
  import fs from "fs";

  cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
  });
  ```

- **File Upload**:

  ```javascript
  const uploadOnCloudinary = async (localFilePath) => {
      try {
          if (!localFilePath) return null;
          const response = await cloudinary.uploader.upload(localFilePath, {
              resource_type: "auto"
          });
          console.log("File uploaded on Cloudinary, file src: " + response.url);
          fs.unlinkSync(localFilePath); // Deletes local file after upload
          return response;
      } catch (error) {
          fs.unlinkSync(localFilePath); // Deletes if upload fails
          return null;
      }
  };

  export { uploadOnCloudinary };
  ```

---
# VidTube App Backend Development Notes (29/10/24)
## Libraries and Tools Used
### jsonwebtoken (npm i jsonwebtoken)

Purpose: Library for generating and verifying JWT (JSON Web Tokens) used in authentication.
Usage in Code: In user.models.js, JWT tokens are generated to create short-lived access and refresh tokens with methods generateAccessToken and generateRefreshToken.
### bcrypt (npm i bcrypt)

Purpose: A library used for hashing passwords securely.
Usage in Code: Passwords are hashed before saving a user to the database using userSchema.pre("save"). The isPasswordCorrect method verifies hashed passwords by comparing them with plain text input during login.
### multer (npm i multer)

Purpose: Middleware for handling file uploads.
Usage in Code: In multer.middlewares.js, Multer’s diskStorage saves uploaded files locally. upload.fields in user.routes.js handles multiple files, such as avatar and coverImage, during registration.
###  cloudinary (npm i cloudinary)

Purpose: Cloud-based image and video management service.
Usage in Code: uploadOnCloudinary function in cloudinary.js uploads images to Cloudinary, and deleteFromCloudinary is used to remove images if a user registration fails.
### fs (Node.js built-in)

Purpose: Provides methods to work with the file system.
Usage in Code: fs is used in getUserCoverImage and getUserAvatarImage to handle image files on the server, checking for file existence and reading file data.
## Detailed Explanation of Code
### 1. Generating Access and Refresh Tokens
``` javascript

const generateAccessAndRefereshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};
```

Explanation: This function fetches a user by userId, generates both tokens, saves the refresh token to the database, and returns both tokens.
### 2. User Registration Controller
```javascript

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    // Check if required fields are empty
    if ([fullname, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw new ApiError(409, "User with email or username already exists");

    // Avatar and Cover Image Upload
    let avatar, coverImage;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");
    avatar = await uploadOnCloudinary(avatarLocalPath);
    coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    // Creating User
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
}); 
```
### Explanation: This function handles user registration, checking for required fields, uploading images to Cloudinary, and creating the user in the database.
Model Definitions
## 1. User Model
``` javascript

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullname: { type: String, required: true, index: true, trim: true },
    avatar: { type: String, required: true },
    coverImage: { type: String },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: { type: String, required: true },
    refreshToken: { type: String }
});
```
### Explanation: Defines user fields, including references to other models (e.g., watchHistory linking to videos) and schema validation.
## 2. Mongoose Hooks and Methods
Password Encryption Hook:

``` javascript

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
```
### Explanation: Hashes the password before saving the user if the password field was modified.
Token Generation Methods:

``` javascript
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};
```
### Explanation: Generates a signed JWT token with user data.
3. Error Handling Middleware
``` javascript
const errorHandler = (err, req, res, next) => {
    let error = err instanceof ApiError ? err : new ApiError(500, "Server Error");
    const response = { message: error.message, ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}) };
    res.status(error.statusCode || 500).json(response);
};
```
Explanation: Custom error handling middleware that formats and sends error responses.
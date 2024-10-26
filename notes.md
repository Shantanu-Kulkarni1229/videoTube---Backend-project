
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

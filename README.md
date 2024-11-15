# VidTube - Mini YouTube Backend

VidTube is a backend project designed as a clone of YouTube, providing functionalities to manage video content, user interactions, and much more. This project is built using modern backend technologies to ensure scalability and efficiency.

---

## Features

- **User Management**: User registration, login, and authentication using JWT.
- **Video Management**: Upload, update, delete, and fetch video data.
- **Comment System**: Add, delete, and fetch comments on videos.
- **Search Functionality**: Search videos by title or description.
- **Testing**: Endpoints thoroughly tested using Postman.

---

## Technologies Used

### Backend
- **Node.js**: Runtime environment for building server-side applications.
- **Express.js**: Web framework for handling routing and middleware.

### Database
- **MongoDB**: NoSQL database for storing user and video data.
- **Mongoose**: ODM library for MongoDB, enabling schema-based modeling.

### API Testing
- **Postman**: Used for testing and validating API endpoints.

### Additional Libraries
- **dotenv**: For environment variable management.
- **jsonwebtoken**: For implementing secure JWT-based authentication.
- **multer**: For handling file uploads (e.g., videos and thumbnails).
- **bcryptjs**: For password hashing.
- **mongoose-pagination-v2**: For implementing pagination in database queries.

---

## Installation Guide

### Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (latest stable version recommended)
- [MongoDB](https://www.mongodb.com/) (local or cloud-based)
- [Postman](https://www.postman.com/) (optional, for API testing)

---

### Steps to Set Up

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/vidtube.git
   cd vidtube
Install Dependencies Run the following command to install all necessary packages:

bash
Copy code
npm install
Configure Environment Variables Create a .env file in the root directory and add the following:

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Run the Server Start the backend server with:


npm start
The server will start on http://localhost:5000 by default.

Test the API Use Postman to test the API endpoints. Import a collection if needed and verify the endpoints.

### API Endpoints
Routes Declaration
Here are the route declarations for the various modules of the VidTube backend:


### Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
### User Routes
POST /api/v1/users/register: Register a new user.
POST /api/v1/users/login: User login.
GET /api/v1/users/profile: Fetch user profile (authentication required).
Video Routes
POST /api/v1/videos: Upload a new video (authentication required).
GET /api/v1/videos: Fetch all videos with pagination support.
GET /api/v1/videos/:id: Fetch a single video by ID.
PUT /api/v1/videos/:id: Update video details (authentication required).
DELETE /api/v1/videos/:id: Delete a video (authentication required).
Comment Routes
POST /api/v1/videos/:id/comments: Add a comment to a video.
GET /api/v1/videos/:id/comments: Fetch all comments for a video.
DELETE /api/v1/comments/:id: Delete a comment (authentication required).


### Future Enhancements
Implementing advanced video search with filters.
Adding video streaming capabilities.
Building a notification system for real-time updates.
Integrating a frontend with React.js or similar frameworks.
Contributing
Contributions are welcome! Here's how you can get involved:

### Fork the repository.
Create a branch for your feature (git checkout -b feature-name).
Commit your changes (git commit -m "Add feature").
Push to the branch (git push origin feature-name).
Open a Pull Request.
License
This project is licensed under the MIT License. See the LICENSE file for details.

### Acknowledgments
Node.js: For a robust runtime environment.
Express.js: For simplifying server-side development.
MongoDB: For a flexible NoSQL database solution.
Postman: For efficient API testing.
Happy coding! 🚀




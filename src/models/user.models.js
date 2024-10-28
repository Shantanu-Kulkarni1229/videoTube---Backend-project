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
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
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

userSchema.pre("save", async function(next)
{
    if(!this.modified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    // short lived access token
   return  jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },process.env.ACCESS_TOKEN_SECRET,
    {
       expiresIN: process.env.ACCESS_TOKEN_EXPIRY
    }
);
}
userSchema.methods.generateRefreshToken = function (){
    // short lived access token
   return  jwt.sign({
        _id : this._id,
    },process.env.REFRESH_TOKEN_SECRET,
    {
       expiresIN: process.env.REFRESH_TOKEN_EXPIRY
    }
);
}
videoSchema.plugin(mongooseAggregatePaginate)
export const User = mongoose.model('User', userSchema);
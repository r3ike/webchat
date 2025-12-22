import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text:{
        type:String,
        required:true
    },
    readBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const Message = new mongoose.Schema("Message", MessageSchema)
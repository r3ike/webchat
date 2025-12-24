import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
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

MessageSchema.index({ conversationId: 1, readBy: 1 });

export const Message = new mongoose.model("Message", MessageSchema)
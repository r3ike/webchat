import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum: ["private", "group"],
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


export const Conversation = mongoose.model("Conversation",ConversationSchema)
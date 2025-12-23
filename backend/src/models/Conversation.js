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
    createdAt: {
        type: Date,
        default: Date.now
    }
})

ConversationSchema.index({ _id: 1});

export const Conversation = mongoose.model("Conversation",ConversationSchema)
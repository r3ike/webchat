import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        unique:true
    },
    nome:{
        type: String,
        required:true
    },
    cognome:{
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required:true
    },
    friends:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    pendingInvites:[{                               //richieste di amicizia di un utente
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastSeen:{
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

UserSchema.index({ username: 1});


export const User = mongoose.model("User", UserSchema)
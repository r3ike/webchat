import {connectDB} from "./mongodb.js"
import {ObjectId} from "mongodb"

export async function addUser(username, email, password){
    const db = connectDB()

    db.collection.insertOne({

    })
}
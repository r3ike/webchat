import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { serverLogger } from "../utils/logger.js";

dotenv.config();

let client;
let db;

async function initIndexes(database) {
    await Promise.all([
        database.collection("users").createIndex(
            { username: 1 },
            { unique: true }
        ),

        database.collection("conversations").createIndex(
            { participants: 1 }
        ),

        database.collection("messages").createIndex(
            { conversationId: 1, createdAt: -1 }
        ),

        database.collection("conversation_reads").createIndex(
            { userId: 1, conversationId: 1 },
            { unique: true }
        )
    ]);

    serverLogger.info({
        event: "mongodb_indexes_ready"
    });
}

export async function connectDB() {
    if (db) return db;

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    db = client.db("chatdb");

    await initIndexes(db);

    serverLogger.info({
        event: "mongodb_connected",
        reason: "MongoDB connesso!"
    });

    return db;
}

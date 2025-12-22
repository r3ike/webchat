import dotenv from "dotenv";
import { serverLogger } from "../utils/logger.js";

dotenv.config();


export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "chatdb"
        });
        serverLogger.info({
            event: "mongodb_connected",
            reason: "MongoDB connesso!"
        });
    } catch (err) {
        serverLogger.error({
            event: "mongodb_connection_error",
            message: err
        });
        process.exit(1);
    }
}

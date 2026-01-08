import { Server } from "socket-io"
import configs from "../../configs/configs.json" with {type: 'json'}

import { socketAuthMiddlewares } from "../middlewares/socket.middlewares.js";
import { setSocketServer } from "./socket.emitter.js";
import {registerChatHandlers} from "./socket.handler.js"

import {updateUserLastSeen} from "../services/db.service.js"

const configs_env = configs[configs.server_status]

let io

export async function initSocket(httpServer) {
    io = Server(httpServer, {
        cors: {
            origin: configs_env.frontend_domain,
            credential: true
        }
    })

    io.use(socketAuthMiddlewares);

    io.on("connection", async socket => {
        /**
         * Durante la connessione aggiorna il last seen dell'utente nel db
         */

        const userId = socket.user._id
        try {
            await updateUserLastSeen(userId)
        } catch (error) {
            console.log(error);
        }

        registerChatHandlers(io, socket);
    });

    setSocketServer(io)

    return io
}



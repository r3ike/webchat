import { Server } from "socket-io"
import configs from "../../configs/configs.json" with {type: 'json'}

import { socketAuthMiddlewares } from "../middlewares/socket.middlewares.js";
import { setSocketServer } from "./socket.emitter.js";
import {registerChatHandlers} from "./socket.handler.js"

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

    io.on("connection", socket => {
        /**
         * Durante la connessione aggiorna il last seen dell'utente nel db
         */

        registerChatHandlers(io, socket);
    });

    setSocketServer(io)

    return io
}



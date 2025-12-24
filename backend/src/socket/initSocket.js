import {Server} from "socket-io"
import configs from "../../configs/configs.json" with {type: 'json'}


const configs_env = configs[configs.server_status]

let io

export async function initSocket(httpServer) {
   io = Server(httpServer, {
        cors: {
            origin: configs_env.frontend_domain,
            credential: true
        }
   }) 


   return io
}
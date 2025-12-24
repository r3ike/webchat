//IMPORT MODULES
import express from "express"
import cors from 'cors'
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'

//IMPORT UTILITIES
import configs from "../configs/configs.json" with { type: 'json' }
import shutdownService from './services/shutdown.service.js';
import {startServer} from './utils/serverStart.js'
import {accessLoggerMiddlewares} from './middlewares/accessLogger.middlewares.js'

//IMPORT ROUTES
import authRoutes from "./routes/auth.routes.js"
import conversationRoutes from "./routes/conversation.routes.js"

const configs_env = configs[configs.server_status]

const app = express()

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json())


// CORS SETUP
app.use(cors({
    origin: configs_env.frontend_domain,    // Origine del client
    credentials: true                       // Consenti l'invio di cookie
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', configs_env.frontend_domain);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

app.set('trust proxy', true);

app.use(accessLoggerMiddlewares)    //Middlewares per loggare ongi richiesta

// Routes
app.use(`/api/${configs.apiVersion}/auth`,authRoutes)
app.use(`/api/${configs.apiVersion}/conversation`,conversationRoutes)

// Cose inutili :)
shutdownService();

export default app
startServer()
import { serverLogger } from '../utils/logger.js';

const shutdownService = () => {

    // Intercetta SIGINT (Ctrl + C)
    process.on('SIGINT', () => {
        serverLogger.warn({
            event:"server_stopped",
            reason:'Server interrotto (SIGINT), applicazione in fase di arresto...'
        });
        // Eventuali operazioni di pulizia prima di terminare
        process.exit(0);
    });

    // Intercetta SIGTERM (arresto da parte di sistema)
    process.on('SIGTERM', () => {
        serverLogger.warn({
            event:"server_stopped",
            reason:'Server interrotto (SIGTERM), applicazione in fase di arresto...'
        });
        // Eventuali operazioni di pulizia prima di terminare
        process.exit(0);
    });

    // Gestisce eventuali errori non catturati
    process.on('uncaughtException', (err) => {
        serverLogger.error({
            event:"server_stopped",
            reason:`Errore non gestito: ${err.message}`
        });
        process.exit(1); // Uscita con errore
    });

    process.on('unhandledRejection', reason => {
        serverLogger.error({
            event:"server_stopped",
            reason:`Unhandled Rejection: ${reason}`
        });
    });

};

export default shutdownService;
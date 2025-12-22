import app from '../app.js';
import configs from '../../configs/configs.json' with {type: 'json'};
import { serverLogger } from './logger.js';

const configs_env = configs[configs.server_status]

export const startServer = async () => {
    // Avvia il server
    app.listen(configs_env.PORT, () => {
        console.log(`Server in ascolto su ${configs_env.backend_domain}:${configs_env.PORT}`);
        console.log(`Avvio in modalità ${configs.server_status}`);

        if (configs.server_status === "production") {
            serverLogger.info({
                event: 'backend_started',
                reason: `Server in ascolto su ${configs_env.backend_domain}:${configs_env.PORT}`
            })
        }
    });
};
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

import configs from '../../configs/configs.json' with {type: 'json'}

// Ottieni il percorso assoluto del file corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Percorso del file di log
const logsDir = path.join(__dirname, '..', '..', 'logs');



function buildLogger(filename, level = 'info') {
  return createLogger({
    level,
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format((info) => {
        info.environment = configs.server_status; // aggiunge il campo "environment" a tutti i log
        return info;
      })(),
      format.json()
    ),
    transports: [
      new transports.File({ filename: path.join(logsDir, filename) }),
      ...(configs.server_status!== 'production' ? [new transports.Console()] : [])
    ]
  });
}


export const appLogger = buildLogger('application.log')
export const accessLogger = buildLogger('access.log')
export const securityLogger = buildLogger('security.log', 'warn')
export const auditLogger = buildLogger('audit.log')
export const serverLogger = buildLogger('server.log')
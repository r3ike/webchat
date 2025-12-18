import { accessLogger } from "../utils/logger.js";

export const accessLoggerMiddlewares = (req, res, next) => {

    const startHrTime = process.hrtime();
    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(3);
        accessLogger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTimeMs: elapsedMs,
            ip: req.ip,          // ora sarà l'IP reale del client
            ips: req.ips,        // array di IP se ci sono più proxy
            protocol:req.protocol,
            client_port:req.socket.remotePort
        });
    });
    next();
};
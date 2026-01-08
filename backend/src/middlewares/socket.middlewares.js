import cookie from "cookie";
import jwt from "jsonwebtoken";


export async function socketAuthMiddlewares(socket, next){
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
        return next(new Error("Nessun cookie"));
    }

    const parsed = cookie.parse(cookies);
    const token = parsed.access_token; // nome del cookie

    if (!token) {
        return next(new Error("Token mancante"));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = payload;
        next();
    } catch (err) {
        next(new Error("Token non valido"));
    }
}
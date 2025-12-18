import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

dotenv.config()

export const authenticateUser = (req,res,next) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Accesso negato: token mancante.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token non valido.' });
        
        
        req.user = user; // Aggiungi le informazioni dell'utente alla richiesta
        next();
    });
}
let index_user = 0
export const authenticateUserTest = (req,res,next) => {
    req.user = {username:`user${index_user}`}
    
    next();
}
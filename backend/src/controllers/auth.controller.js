import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import { insertUser, getUserByEmail, getUserByUsername } from "../services/db.service.js"

dotenv.config()

//Controller per la registrazione di un nuovo utente => raggiungibile attraverso la route "POST /api/v1/auth/register"
export async function registerController(req, res) {
    const username = req.body.username
    const nome = req.body.nome
    const cognome = req.body.cognome
    const email = req.body.email
    const password = req.body.password

    //Validazione

    //

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        await insertUser(nome, cognome, email, hashedPassword, username)

        //Logging

        //
        return res.status(200).json({ message: "Utente registrato con successo!" })
    } catch (error) {
        //Logging

        return res.status(400).json({ message: "Errore nella registrazione dell'utente!" })
    }
}

//Controller per il login di un  utente => raggiungibile attraverso la route "POST /api/v1/auth/login"
export async function loginController(req, res) {
    const username = req.body.username
    const password = req.body.password

    //Validazione

    try {
        const userData = getUserByUsername(username)
        if (!userData) {
            return res.status(401).json({ message: "Utente non trovato!" })
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return res.status(401).json({ message: "Errore nel login!" })
        }

        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: configs.JWT_EXPIRATION });

        // Imposta il cookie HttpOnly
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true, // Solo HTTPS in produzione
            sameSite: 'Strict'
        });

        //Logging

        return res.status(200).json({message: "Login avvenuto con successo"})
    } catch (error) {
        return res.status(401).json({ message: "Errore nel login dell'utente!" })
    }
}

//Controller per controllare se un utente ha il token => chiamata durante onload di ogni pagina frontend 
// => raggiungibile attraverso la route "POST /api/v1/auth/check"
export async function checkAuthController(req, res) {
    res.status(200).json({ user: req.user.userData })
}

//Controller per il logout di un  utente => raggiungibile attraverso la route "POST /api/v1/auth/logout"
export async function logoutController(req, res) {
    try {
        res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "Strict" });
        return res.status(200).json({ message: "Logout riuscito" });
    } catch (error) {
        return res.status(500).json({ message: "Errore durante il logout" });
    }
}
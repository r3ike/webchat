import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import configs from "../../configs/configs.json" with {type:'json'}

import { insertUser,getUserById, getUserByEmail, getUserByUsername, getCompleteUserByUsername, getUserByIdWithoutPassword } from "../services/db.service.js"

dotenv.config()

const configs_env = configs[configs.server_status]

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
        console.log(error);
        

        return res.status(400).json({ message: "Errore nella registrazione dell'utente!" })
    }
}

//Controller per il login di un  utente => raggiungibile attraverso la route "POST /api/v1/auth/login"
export async function loginController(req, res) {
    const username = req.body.username
    const password = req.body.password

    //Validazione

    try {
        const userData = await getUserByUsername(username)

        if (!userData) {
            return res.status(401).json({ message: "Utente non trovato!" })
        }

        const isValidPassword = await bcrypt.compare(password, userData.password)

        if (!isValidPassword) {
            return res.status(401).json({ message: "Errore nel login!" })
        }

        const completeUserData = await getCompleteUserByUsername(username)

        const token = jwt.sign(completeUserData, process.env.JWT_SECRET, { expiresIn: configs.JWT_EXPIRATION });

        // Imposta il cookie HttpOnly
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: configs.server_status === "production", // Solo HTTPS in produzione
            sameSite: 'Strict'
        });

        //Logging

        return res.status(200).json({message: "Login avvenuto con successo"})
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({ message: "Errore nel login dell'utente!" })
    }
}

//Controller per controllare se un utente ha il token => chiamata durante onload di ogni pagina frontend 
// => raggiungibile attraverso la route "POST /api/v1/auth/check"
export async function checkAuthController(req, res) {
    const user = await getUserByIdWithoutPassword(req.user._id)
    res.status(200).json(user)
}

//Controller per il logout di un  utente => raggiungibile attraverso la route "POST /api/v1/auth/logout"
export async function logoutController(req, res) {
    try {
        res.clearCookie("jwt", { httpOnly: true, secure: configs.server_status === "production", sameSite: "Strict" });
        return res.status(200).json({ message: "Logout riuscito" });
    } catch (error) {
        return res.status(500).json({ message: "Errore durante il logout" });
    }
}
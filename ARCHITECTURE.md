

# Struttura Completa del Progetto WebChat

## Albero delle Directory

```
webchat/
├── docker-compose.yaml          # Configurazione Docker (backend, nginx, mongodb)
├── README.md                    # README principale del progetto
│
├── backend/                     # API REST + WebSocket
│   ├── .env                     # Variabili d'ambiente
│   ├── Dockerfile               # Immagine Docker del backend
│   ├── package.json             # Dipendenze Node.js
│   ├── configs/
│   │   └── configs.json         # Configurazione (porte, ecc.)
│   ├── logs/                    # Log dell'applicazione
│   ├── src/
│   │   ├── app.js               # Server Express principale
│   │   ├── controllers/         # Logica di business
│   │   │   ├── auth.controller.js
│   │   │   ├── conversation.controller.js
│   │   │   ├── message.controller.js
│   │   │   └── user.controller.js
│   │   ├── db/
│   │   │   └── connect.js       # Connessione MongoDB
│   │   ├── middlewares/         # Middleware Express
│   │   │   ├── accessLogger.middlewares.js
│   │   │   ├── auth.middlewares.js
│   │   │   └── socket.middlewares.js
│   │   ├── models/              # Schemi Mongoose
│   │   │   ├── Conversation.js  # Modello di conversazione
│   │   │   ├── Message.js       # Modello di messaggio
│   │   │   └── User.js          # Modello utente
│   │   ├── routes/              # Rotte Express
│   │   │   ├── auth.routes.js
│   │   │   ├── conversation.routes.js
│   │   │   ├── message.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/            # Servizi DB e utilità
│   │   │   ├── db.service.js    # Query al database
│   │   │   └── shutdown.service.js
│   │   ├── socket/              # Logica WebSocket
│   │   │   ├── initSocket.js    # Inizializzazione
│   │   │   ├── socket.emitter.js
│   │   │   └── socket.handler.js
│   │   └── utils/               # Utilità
│   │       ├── logger.js
│   │       └── serverStart.js
│   └── README.md                # Documentazione backend
│
└── frontend/                    # Frontend HTML/CSS/JS
    ├── index.html               # Punto di ingresso
    ├── README.md                # Guida generale
    ├── DOCUMENTATION.md         # Documentazione architettura
    ├── CONFIGURATION.md         # Guida alla configurazione
    ├── USAGE.md                 # Guida all'utilizzo
    ├── .gitignore               #
    ├── server.sh                # Script per servire in locale
    │
    ├── css/
    │   └── styles.css           # Stili globali (~1500 righe)
    │
    └── js/
        ├── config.js            # Configurazione globale (URL, eventi)
        ├── api.js               # Client API REST
        ├── socket.js            # Gestore WebSocket
        ├── router.js            # Sistema di routing
        ├── main.js              # Inizializzazione app
        │
        └── pages/               # Pagine dell'applicazione
            ├── auth.js          # Login/Registrazione
            ├── chat.js          # Chat principale (più complessa)
            ├── profile.js       # Profilo e impostazioni
            └── friends.js       # Gestione amici
```

## Statistiche del Progetto

### Backend

* **File**: 16
* **Linee di codice**: ~2000+
* **Linguaggio**: JavaScript (Node.js)
* **Database**: MongoDB
* **Auth**: JWT

### Frontend

* **File HTML**: 1
* **File CSS**: 1 (~2000 righe)
* **File JS**: 8 (~1500 righe)
* **Linguaggio**: HTML5, CSS3, JavaScript vanilla
* **Nessun framework**: Puro HTML/CSS/JS

### Totale

* **File**: ~25
* **Linee di codice**: ~5000+
* **Documentazione**: 4 file README

## Flusso Dati Generale

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB BROWSER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Frontend (HTML/CSS/JS)                  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Pagine (auth, chat, profile, friends)         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │         ↑ ↓                         ↑ ↓              │   │
│  │    ┌─────────────┐           ┌──────────────┐       │   │
│  │    │   API.js    │           │  Socket.js   │       │   │
│  │    │ (HTTP REST) │           │ (WebSocket)  │       │   │
│  │    └─────────────┘           └──────────────┘       │   │
│  │         ↓                          ↓                │   │
│  │         HTTP POST/GET             WS              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────┬─────────────────┘
                      │                      │
        ┌─────────────┴──────────────────┐   │
        │     Connessione HTTPS/TLS      │   │
        └──────────────────┬─────────────┘   │
                           ↓                  │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Server Express + Socket.IO                    │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │  │
│  │  │ Rotte Auth   │  │ Rotte Chat   │  │Rotte Msg │  │  │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │  │
│  │         ↓                ↓                  ↓        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Controller                           │   │  │
│  │  │  (auth, conversation, message, user)        │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │         ↓                                          │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Servizio Database                     │   │  │
│  │  │  (db.service.js - Query DB)                 │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│         ↓                                                    │
└────────────────┬──────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│              MongoDB (Database)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Collezioni:                                         │
│  │  ├── Users       (utenti, amici, richieste)          │
│  │  ├── Messages    (messaggi con metadati)             │
│  │  └── Conversations (conversazioni e membri)          │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Interazioni Principali

### 1. Registrazione Utente

```
Frontend                    Backend                  MongoDB
   │                          │                         │
   ├─ Form registrazione ─────→│                         │
   │  (username, email, pwd)  │                         │
   │                          ├─ Hash password          │
   │                          ├─ Validazione dati       │
   │                          ├─ Inserisce user ───────→│
   │                          │                        │
   │                          │                        ├─ Salvataggio
   │                          │←─ Conferma────────────│
   │←─ Messaggio successo────│                         │
   │                          │                         │
```

### 2. Login

```
Frontend                    Backend                  MongoDB
   │                          │                         │
   ├─ Form login ────────────→│                         │
   │  (username, pwd)        │                         │
   │                          ├─ Cerca user ──────────→│
   │                          │                        │
   │                          │←─ Dati user───────────│
   │                          │                         │
   │                          ├─ Verifica password     │
   │                          ├─ Crea JWT              │
   │                          ├─ Set cookie HttpOnly   │
   │←─ Successo + Cookie─────│                         │
   │                          │                         │
   ├─ Connessione WebSocket  │                         │
   │                          │←─ Welcome + dati user──│
   │                          │                         │
```

### 3. Invio Messaggio

```
Frontend                    Backend                  MongoDB
   │                          │                         │
   ├─ Evento WebSocket ──────→│                         │
   │  send_message            │                         │
   │                          ├─ Verifica utente       │
   │                          ├─ Crea messaggio ──────→│
   │                          │                        │
   │                          │                        ├─ Inserimento
   │                          │←─ ID messaggio────────│
   │                          │                         │
   │                          ├─ Emit evento alla room │
   │←─ Broadcast messaggio───│                         │
   │  (new_message)           │                         │
   │                          │                         │
```

## Stack Tecnologico

### Frontend

* **HTML5**: Semantico e accessibile
* **CSS3**: Variabili, Grid, Flexbox
* **JavaScript**: ES6+, Vanilla (senza dipendenze)
* **Socket.IO Client**: WebSocket real-time
* **Font Awesome**: Icone
* **UI Avatars**: Avatar generati

### Backend

* **Node.js**: Runtime
* **Express**: Framework web
* **Mongoose**: ODM per MongoDB
* **Socket.IO**: WebSocket
* **JWT**: Autenticazione
* **bcrypt**: Hash password
* **cors**: Controllo origine

### Database

* **MongoDB**: Database NoSQL
* **Mongoose**: Validazione schema

### DevOps

* **Docker**: Containerizzazione
* **Docker Compose**: Orchestrazione locale
* **Nginx**: Reverse proxy

## Flussi di Utilizzo Principali

### 1. Flusso di Registrazione

```
Pagina iniziale
    ↓
Click "Registrati"
    ↓
Compilazione form
    ↓
Validazione client
    ↓
POST /api/v1/auth/register
    ↓
Backend valida e salva
    ↓
Messaggio di successo
    ↓
Pagina login
```

### 2. Flusso Chat

```
Seleziona conversazione
    ↓
GET /api/v1/conversation/:id
    ↓
Mostra messaggi
    ↓
WebSocket join room
    ↓
Utente scrive
    ↓
Emit evento typing
    ↓
Premi invio
    ↓
WebSocket send_message
    ↓
Backend processa
    ↓
emit new_message alla room
    ↓
Tutti nella room ricevono
```

### 3. Flusso Amici

```
Gestione amici
    ↓
Seleziona utente
    ↓
POST /api/v1/user/friends
    ↓
Backend valida
    ↓
Salva richiesta pendente
    ↓
Notifica utente B
    ↓
Utente B vede richiesta
    ↓
Click Accetta
    ↓
POST /api/v1/user/friends/accept
    ↓
Aggiorna relazione in DB
    ↓
Ora sono amici
```

## Funzionalità per Pagina

### Pagina di Autenticazione

* ✅ Login con username/password
* ✅ Registrazione con validazione
* ✅ Toggle login/registrazione
* ✅ Gestione errori

### Pagina Chat

* ✅ Sidebar con conversazioni
* ✅ Ricerca chat
* ✅ Area messaggi
* ✅ Input con auto-resize
* ✅ Invio messaggi (Enter)
* ✅ Indicatore di scrittura
* ✅ Eliminazione messaggi
* ✅ Timestamp
* ✅ Menu con logout
* ✅ Creazione nuova conversazione

### Pagina Profilo

* ✅ Visualizzazione dati personali
* ✅ Modifica nome/cognome/email
* ✅ Cambio password
* ✅ Configurazione privacy
* ✅ Configurazione notifiche
* ✅ Eliminazione account
* ✅ Sezioni multiple con tab

### Pagina Amici

* ✅ Lista amici
* ✅ Richieste inviate
* ✅ Richieste ricevute
* ✅ Ricerca utenti
* ✅ Invio richiesta
* ✅ Accetta/rifiuta
* ✅ Rimuovi amico
* ✅ Stato online
* ✅ Ultimo accesso

## Sicurezza Implementata

1. **Autenticazione JWT**

   * Token in cookie HTTP-Only
   * Non accessibile da JavaScript
   * Scadenza automatica

2. **Hash Password**

   * bcrypt con salt
   * Nessuna password in chiaro

3. **CORS Configurato**

   * Solo dominio frontend
   * Credentials abilitate

4. **Validazione Input**

   * Client: validazione base
   * Server: validazione completa

5. **Protezione XSS**

   * Escape HTML nei messaggi
   * Header Content-Type sicuri

6. **Protezione CSRF**

   * JWT al posto di CSRF token
   * Cookie SameSite

## Considerazioni di Scalabilità

### Frontend

* Attualmente tutto caricato in una pagina
* Per grande scala: Code splitting
* Implementare Service Worker per offline
* Cache asset con hash nel nome

### Backend

* Attualmente monolitico
* Per scalare: Microservizi
* Separare WebSocket su server dedicato
* Cache con Redis

### Database

* Attualmente senza indici
* Aggiungere indici per: username, email, user_id
* Considerare sharding oltre 1M utenti

## Prossimi Passi Suggeriti

1. **Breve termine (1-2 settimane)**

   * Ricerca utenti nel backend
   * Creazione chat 1-a-1
   * Notifiche browser
   * Temi (dark mode)

2. **Medio termine (1-2 mesi)**

   * Upload file
   * Supporto emoji avanzato
   * Ricerca messaggi
   * Editor profilo

3. **Lungo termine (2-6 mesi)**

   * Chiamate vocali
   * Crittografia E2E
   * Sincronizzazione offline
   * App mobile

---


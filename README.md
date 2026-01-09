# Webchat
Per questa chat web si è optato per un architettura ibrida, dove i socket servono solo per notificare eventi, i quali fanno partire richieste
alle API rest che forniscono i dati.
Tutta l'infrastruttura si basa su container Docker, in particolare uno per il backend **NodeJS**, uno per **NGINX** e un per **mongoDB**.
## Socket

### Socket events types:
- **NEW_MESSAGE**: Manda la notifica a tutti gli utenti che hanno attualmente aperta la chat, come payload manda anche il messaggio.
- **TYPING**: Inviata da un client quando l'utente sta scrivendo.
- **CHAT_UPDATE**: Usata per notificare un update su una chat (es: cambio nome, nuovo ultimo messaggio ecc...) nel payload c'è la convId.
- **MSG_UPDATE**: Usata per notificare la modifica o l'eliminazione di un messaggio, nel payload viene passato l'id della conversazione.

Differenza tra chat_update e msg_update:
 - **CHAT_UPDATE**: notifica la modifica di una chat => fa partire la get che prende solo le info della chat senza messaggi.
 - **MSG_UPDATE**: notifica la modifica di un messaggio => fa partire la get che prende tutti i messaggi di quella chat.

### Gestione ROOM
E' stato deciso l'utilizzo di due tipi di room:
    - **User Room**:Room riservata ad un singolo utente, il quale ci entra quando si connette e ci esce quando si disconnette. Questa room è usata dal server per notificare Eventi di tipo: **CHAT_UPDATE**.
    - **Chat Room**:Room dove entrano tutti gli utenti che aprono una specifica chat, si crea una room oer ogni chat esistente. In questi tipi di room vengono inviati eventi di tipo **TYPING**,**NEW_MESSAGE**,**MSG_UPDATE**, in quanto sono rilevanti solo per gli utenti che hanno aperta la chat in quel momento.

Tali differenze sono state fatte perchè alcuni eventi è necessario che vengano notificati a tutti gli utenti che appartengono lla chat, anche se in quel momento hanno aperta un'altra chat(e che quindi sono in un'altra room).

## Persistenza dei messaggi
Per garantire la persistenza dei dati è stato deciso di utilizzare un database non relazione, ovvero MongoDB.
Il backend, inoltre, non interagisce direttamente con il db, ma utilizzare **Mongoose** come ORM (Object-Relational Mapping).

## Autenticazione
Per l'autenticazione è stato deciso un approccio basato su **JWT** (Json Web Token), il token contenente tutte le info dell'utente (Per evitare ulteriori query al DB) viene restituito attraverso un Cookie HTTP-ONLY, non accessibile dal javascript del frontend.
## .env prototype

### .env del backend
```
MONGODB_USER=admin
MONGODB_PW=yyy
MONGODB_URI=mongodb://admin:yyy@mongodb:27017/chatdb?authSource=admin

JWT_SECRET=zzz
```

### .env docker.compose
Questo .env è ancora da mettere, in ogni caso il prototipo sarebbe questo:
```
MONGODB_INITDB_ROOT_USERNAME=admin
MONGODB_INITDB_ROOT_PASSWORD=yyy
MONGODB_INITDB_DATABASE=chatdb
```
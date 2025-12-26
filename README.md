# Webchat

## Socket

Socket message types:
- new-message => passa il nuovo messaggio
- update-message
- update-chat

Ogni update-... fa partire lato client una richiesta REST che prente tutti i dati aggiornati.
Quindi i socket sono usati con sistema di notifiche, i dati veri e propri sono passati tramite REST
// Configurazione frontend
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    SOCKET_URL: 'http://localhost:3000/ws',
    API_VERSION: 'v1'
};

// Tipi di evento socket
const SOCKET_EVENTS = {
    NEW_MESSAGE: 'new_message',
    TYPING: 'typing',
    CHAT_UPDATE: 'chat_update',
    MSG_UPDATE: 'msg_update',
    SEND_MESSAGE: 'send_message',
    CHANGE_CHAT: 'change_chat',
    TYPING_EVENT: 'typing'
};

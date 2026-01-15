// Configurazione frontend
const CONFIG = {
    API_BASE_URL: 'http://localhost/api/v1',
    SOCKET_URL: 'http://localhost',
    API_VERSION: 'v1'
};

// Tipi di evento socket
const SOCKET_EVENTS = {
    NEW_MESSAGE: 'new_message',
    TYPING: 'typing',
    CHAT_UPDATE: 'chat_update',
    MSG_UPDATE: 'msg_update',
    SEND_MESSAGE: 'send_message',
    CHANGE_CHAT: 'change_chat'
};

// Socket.IO gestione
class SocketManager {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.listeners = {};
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = io(CONFIG.SOCKET_URL, {
                path: "/ws",
                withCredentials: true
            });

            this.socket.on('connect', () => {
                console.log('Socket connesso');
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket errore:', error);
                reject(error);
            });

            this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
                this.emit('newMessage', data);
            });

            this.socket.on(SOCKET_EVENTS.TYPING, (data) => {
                this.emit('typing', data);
            });

            this.socket.on(SOCKET_EVENTS.CHAT_UPDATE, (data) => {
                this.emit('chatUpdate', data);
            });

            this.socket.on(SOCKET_EVENTS.MSG_UPDATE, (data) => {
                this.emit('msgUpdate', data);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    sendMessage(convId, text) {
        this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { convId, text });
    }

    changeChat(convPrev, convAtt) {
        this.socket.emit(SOCKET_EVENTS.CHANGE_CHAT, { convPrev, convAtt });
    }

    emitTyping(convId) {
        this.socket.emit(SOCKET_EVENTS.TYPING, { convId });
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

const socketManager = new SocketManager();

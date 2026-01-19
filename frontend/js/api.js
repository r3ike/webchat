// API wrapper
class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Errore nella richiesta');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(username, nome, cognome, email, password) {
        return this.request('POST', '/auth/register', { username, nome, cognome, email, password });
    }

    async login(username, password) {
        return this.request('POST', '/auth/login', { username, password });
    }

    async checkAuth() {
        return this.request('POST', '/auth/check');
    }

    async logout() {
        return this.request('POST', '/auth/logout');
    }

    // Conversation endpoints
    async getAllConversations() {
        return this.request('GET', '/conversation/');
    }

    async getConversationById(convId) {
        return this.request('GET', `/conversation/${convId}`);
    }

    async createConversation(members, name, type = 'group') {
        return this.request('POST', '/conversation/', { members, name, type });
    }

    async deleteConversation(convId) {
        return this.request('DELETE', '/conversation/', { convId });
    }

    async addChatMember(convId, memberId) {
        return this.request('POST', '/conversation/member', { convId, memberId });
    }

    async removeChatMember(convId, memberId) {
        return this.request('DELETE', '/conversation/member', { convId, memberId });
    }

    // Message endpoints
    async getMessages(convId) {
        return this.request('GET', `/messages/${convId}`);
    }

    async deleteMessage(msgId, convId) {
        return this.request('DELETE', '/messages/', { msgId, convId });
    }

    async getReadBy(msgId) {
        return this.request('GET', `/messages/readby/${msgId}`);
    }

    // User/Friends endpoints
    async getAllUsers() {
        return this.request('GET', '/user/');
    }

    async sendFriendInvite(userId) {
        return this.request('POST', '/user/friends', { destUserId: userId });
    }

    async acceptFriendInvite(userId) {
        return this.request('POST', '/user/friends/accept', { inviteSenderId: userId });
    }

    async declineFriendInvite(userId) {
        return this.request('POST', '/user/friends/decline', { inviteSenderId: userId });
    }

    async removeFriend(userId) {
        return this.request('DELETE', '/user/friends', { friendId: userId });
    }
}

const api = new API();

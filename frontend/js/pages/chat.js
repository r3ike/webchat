// Pagine della chat principale
const ChatPages = {
    currentConversation: null,
    conversations: [],
    typingUsers: new Set(),
    typingTimeout: null,

    mainPage(user) {
        return `
            <div class="chat-container">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-header">
                        <h2>WebChat</h2>
                        <div class="header-actions">
                            <button id="newChatBtn" class="icon-btn" title="Nuova chat">
                                <i class="fas fa-pen-to-square"></i>
                            </button>
                            <button id="menuBtn" class="icon-btn" title="Menu">
                                <i class="fas fa-ellipsis-vertical"></i>
                            </button>
                            <div id="menu" class="menu-dropdown" style="display: none;">
                                <a href="#" id="goToProfile">
                                    <i class="fas fa-user"></i> Profilo
                                </a>
                                <a href="#" id="goToFriends">
                                    <i class="fas fa-users"></i> Amici
                                </a>
                                <a href="#" id="logoutBtn">
                                    <i class="fas fa-sign-out-alt"></i> Esci
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="search-box">
                        <input type="text" id="searchChat" placeholder="Cerca chat..." />
                        <i class="fas fa-search"></i>
                    </div>

                    <div id="conversationsList" class="conversations-list">
                        <!-- Conversazioni caricate dinamicamente -->
                    </div>
                </div>

                <!-- Area chat principale -->
                <div class="chat-area">
                    <div id="chatContent" class="chat-content">
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <h3>Seleziona una chat per iniziare</h3>
                            <p>Scegli una conversazione dalla lista o crea una nuova chat</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachListeners() {
        this.loadConversations();
        this.setupEventListeners();
        this.setupSocketListeners();
    },

    setupEventListeners() {
        const menuBtn = document.getElementById('menuBtn');
        const menu = document.getElementById('menu');
        const goToProfile = document.getElementById('goToProfile');
        const goToFriends = document.getElementById('goToFriends');
        const logoutBtn = document.getElementById('logoutBtn');
        const newChatBtn = document.getElementById('newChatBtn');
        const searchChat = document.getElementById('searchChat');

        menuBtn.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-actions')) {
                menu.style.display = 'none';
            }
        });

        goToProfile.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('profile');
        });

        goToFriends.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('friends');
        });

        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await api.logout();
                socketManager.disconnect();
                router.navigate('login');
            } catch (error) {
                console.error('Errore logout:', error);
            }
        });

        newChatBtn.addEventListener('click', async () => {
            await this.showNewChatDialog();
        });

        searchChat.addEventListener('input', (e) => {
            this.filterConversations(e.target.value);
        });
    },

    setupSocketListeners() {
        socketManager.on('newMessage', (data) => {
            console.log(data);
            
            if (this.currentConversation && data.msg.conversationId === this.currentConversation._id) {
                this.addMessageToChat(data.msg);
                this.scrollToBottom();
            }
            this.updateConversationList();
        });

        socketManager.on('typing', (data) => {
            if (this.currentConversation && data.convId === this.currentConversation._id) {
                if (!this.typingUsers.has(data.userId)) {
                    this.typingUsers.add(data.userId);
                    this.updateTypingIndicator();
                }

                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.typingUsers.clear();
                    this.updateTypingIndicator();
                }, 3000);
            }
        });

        socketManager.on('chatUpdate', (data) => {
            this.loadConversations();
        });

        socketManager.on('msgUpdate', (data) => {
            console.log('update messaggi');
            console.log(data);
            
            
            if (this.currentConversation && data.convId === this.currentConversation._id) {
                this.loadChatMessages();
            }
        });
    },

    async loadConversations() {
        try {
            const response = await api.getAllConversations();
            this.conversations = response;
            this.renderConversationsList();
        } catch (error) {
            console.error('Errore caricamento conversazioni:', error);
        }
    },

    renderConversationsList() {
        const list = document.getElementById('conversationsList');
        if (!list) return;

        if (this.conversations.length === 0) {
            list.innerHTML = '<div class="empty-list">Nessuna chat ancora</div>';
            return;
        }

        list.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item ${this.currentConversation && this.currentConversation._id === conv._id ? 'active' : ''}" data-conv-id="${conv._id}">
                <div class="conversation-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}" alt="${conv.name}">
                </div>
                <div class="conversation-info">
                    <h4>${conv.name}</h4>
                    <p>${conv.lastMessage ? conv.lastMessage.text.substring(0, 40) + '...' : 'Nessun messaggio'}</p>
                </div>
                <div class="conversation-meta">
                    <span class="timestamp">${this.formatTime(conv.lastMessage?.createdAt)}</span>
                </div>
            </div>
        `).join('');

        // Attach click listeners
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.convId;
                this.selectConversation(convId);
            });
        });
    },

    async selectConversation(convId) {
        try {
            const response = await api.getConversationById(convId);
            this.currentConversation = response;
            
            // Notifica socket del cambio chat
            socketManager.changeChat(this.currentConversation._id, convId);
            
            this.renderChatArea();
            this.loadChatMessages();
            this.renderConversationsList();
        } catch (error) {
            console.error('Errore caricamento chat:', error);
        }
    },

    renderChatArea() {
        const chatContent = document.getElementById('chatContent');
        
        chatContent.innerHTML = `
            <div class="chat-header">
                <div class="header-info">
                    <h3>${this.currentConversation.name}</h3>
                    <p>${this.currentConversation.members.length} partecipanti</p>
                </div>
                <button id="deleteConvBtn" class="icon-btn" title="Elimina chat">
                    <i class="fas fa-trash"></i>
                </button>
            </div>

            <div id="messagesContainer" class="messages-container">
                <!-- Messaggi caricati dinamicamente -->
            </div>

            <div id="typingIndicator" class="typing-indicator" style="display: none;">
                <span></span><span></span><span></span>
            </div>

            <div class="message-input-area">
                <textarea id="messageInput" placeholder="Scrivi un messaggio..." rows="1"></textarea>
                <button id="sendMessageBtn" class="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        this.attachChatAreaListeners();
    },

    attachChatAreaListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendMessageBtn');
        const deleteConvBtn = document.getElementById('deleteConvBtn');

        // Auto-resize textarea
        messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            
            // Emit typing event
            if (e.target.value.trim()) {
                socketManager.emitTyping(this.currentConversation._id);
            }
        });

        // Send message on Enter
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        deleteConvBtn.addEventListener('click', async () => {
            if (confirm('Sei sicuro di voler eliminare questa chat?')) {
                try {
                    await api.deleteConversation(this.currentConversation._id);
                    this.currentConversation = null;
                    this.loadConversations();
                    document.getElementById('chatContent').innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <h3>Seleziona una chat per iniziare</h3>
                            <p>Scegli una conversazione dalla lista o crea una nuova chat</p>
                        </div>
                    `;
                } catch (error) {
                    alert('Errore nell\'eliminazione della chat');
                }
            }
        });
    },

    async loadChatMessages() {
        try {
            const messages = await api.getMessages(this.currentConversation._id);
                        
            const messagesContainer = document.getElementById('messagesContainer');
            if (!messagesContainer) return;

            messagesContainer.innerHTML = messages.map(msg => this.renderMessage(msg)).join('');
            this.scrollToBottom();
        } catch (error) {
            console.error('Errore caricamento messaggi:', error);
        }
    },

    renderMessage(msg) {
        const isOwn = msg.sender._id === router.currentUser._id;
        return `
            <div class="message ${isOwn ? 'own' : ''}" data-msg-id="${msg._id}">
                <div class="message-content">
                    ${!isOwn ? `<div class="message-sender">${msg.sender.username}</div>` : ''}
                    <p>${this.escapeHtml(msg.text)}</p>
                    <span class="message-time">${this.formatTime(msg.createdAt)}</span>
                </div>
                ${isOwn ? `
                    <div class="message-actions">
                        <button class="delete-msg-btn" data-msg-id="${msg._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    addMessageToChat(msg) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            const messageEl = document.createElement('div');
            messageEl.innerHTML = this.renderMessage(msg);
            messagesContainer.appendChild(messageEl.firstElementChild);

            // Attach delete listener
            const deleteBtn = messagesContainer.querySelector(`[data-msg-id="${msg._id}"] .delete-msg-btn`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteMessage(msg._id));
            }
        }
    },

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();

        if (!text) return;

        socketManager.sendMessage(this.currentConversation._id, text);
        messageInput.value = '';
        messageInput.style.height = 'auto';

    },

    async deleteMessage(msgId) {
        if (confirm('Eliminare questo messaggio?')) {
            try {
                await api.deleteMessage(msgId, this.currentConversation._id);
                this.loadChatMessages();
            } catch (error) {
                alert('Errore nell\'eliminazione del messaggio');
            }
        }
    },

    updateTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = this.typingUsers.size > 0 ? 'block' : 'none';
        }
    },

    async showNewChatDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Nuova Chat</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="newChatName" placeholder="Nome della chat" />
                    <div id="friendsList" class="friends-list-modal">
                        <!-- Amici caricati dinamicamente -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-btn">Annulla</button>
                    <button class="btn btn-primary" id="createChatBtn">Crea</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const closeBtn = dialog.querySelectorAll('.close-btn');
        closeBtn.forEach(btn => {
            btn.addEventListener('click', () => dialog.remove());
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });

        const createBtn = dialog.querySelector('#createChatBtn');
        createBtn.addEventListener('click', async () => {
            const chatName = document.getElementById('newChatName').value;
            const selectedFriends = Array.from(dialog.querySelectorAll('.friend-checkbox:checked')).map(cb => cb.value);

            if (!chatName || selectedFriends.length === 0) {
                alert('Compila tutti i campi');
                return;
            }

            try {
                await api.createConversation(selectedFriends, chatName, 'group');
                this.loadConversations();
                dialog.remove();
            } catch (error) {
                alert('Errore nella creazione della chat');
            }
        });

        // Load friends
        const friendsList = dialog.querySelector('#friendsList');
        try {
            const response = await api.checkAuth();
            const currentUserFriends = response.friends || [];
            
            if (currentUserFriends.length === 0) {
                friendsList.innerHTML = '<p>No tienes amigos aún. Agrega amigos primero.</p>';
                return;
            }

            friendsList.innerHTML = currentUserFriends.map(friend => `
                <div class="friend-checkbox-item">
                    <input type="checkbox" class="friend-checkbox" value="${friend._id}">
                    <label>
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(friend.nome + ' ' + friend.cognome)}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 0.5rem;">
                        ${friend.nome} ${friend.cognome}
                    </label>
                </div>
            `).join('');
        } catch (error) {
            friendsList.innerHTML = '<p>Error loading friends</p>';
            console.error('Error loading friends:', error);
        }
    },

    filterConversations(query) {
        if (!query.trim()) {
            // Si la query está vacía, muestra todas las conversaciones
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => {
                item.style.display = 'flex';
            });
            return;
        }

        const items = document.querySelectorAll('.conversation-item');
        const queryLower = query.toLowerCase();
        
        items.forEach(item => {
            // Busca en nombre de la conversación y en el último mensaje
            const convName = item.querySelector('h4')?.textContent.toLowerCase() || '';
            const lastMsg = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            const matches = convName.includes(queryLower) || lastMsg.includes(queryLower);
            item.style.display = matches ? 'flex' : 'none';
        });
    },

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    updateConversationList() {
        this.loadConversations();
    },

    formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Adesso';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm fa';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h fa';
        if (diff < 604800000) return Math.floor(diff / 86400000) + 'g fa';

        return date.toLocaleDateString('it-IT');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

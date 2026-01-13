// Pagina gestione amici
const FriendsPages = {
    friends: [],
    pendingInvites: [],
    receivedInvites: [],

    friendsPage(user) {
        return `
            <div class="friends-container">
                <div class="friends-header">
                    <button class="friends-back">
                        <i class="fas fa-arrow-left"></i> Indietro
                    </button>
                    <h2>Gestione Amici</h2>
                    <input type="text" id="searchFriends" placeholder="Cerca amici..." class="search-input">
                </div>

                <div class="friends-tabs">
                    <button class="tab-btn active" data-tab="friends">
                        <i class="fas fa-users"></i> I Miei Amici
                        <span class="badge" id="friendsCount">0</span>
                    </button>
                    <button class="tab-btn" data-tab="pending">
                        <i class="fas fa-hourglass-half"></i> In Sospeso
                        <span class="badge" id="pendingCount">0</span>
                    </button>
                    <button class="tab-btn" data-tab="received">
                        <i class="fas fa-inbox"></i> Richieste Ricevute
                        <span class="badge" id="receivedCount">0</span>
                    </button>
                    <button class="tab-btn" data-tab="add">
                        <i class="fas fa-user-plus"></i> Aggiungi Amico
                    </button>
                </div>

                <div class="friends-content">
                    <!-- Tab: I Miei Amici -->
                    <div class="tab-content active" id="tab-friends">
                        <div id="friendsList" class="friends-list">
                            <!-- Amici caricati dinamicamente -->
                        </div>
                    </div>

                    <!-- Tab: Richieste In Sospeso -->
                    <div class="tab-content" id="tab-pending">
                        <div id="pendingList" class="friends-list">
                            <!-- Richieste in sospeso caricate dinamicamente -->
                        </div>
                    </div>

                    <!-- Tab: Richieste Ricevute -->
                    <div class="tab-content" id="tab-received">
                        <div id="receivedList" class="friends-list">
                            <!-- Richieste ricevute caricate dinamicamente -->
                        </div>
                    </div>

                    <!-- Tab: Aggiungi Amico -->
                    <div class="tab-content" id="tab-add">
                        <div class="add-friend-section">
                            <h3>Trova Utenti</h3>
                            <div class="search-users">
                                <input type="text" id="userSearchInput" placeholder="Digita un nome utente...">
                                <button class="btn btn-primary" id="searchUserBtn">Cerca</button>
                            </div>
                            <div id="userSearchResults" class="search-results">
                                <!-- Risultati di ricerca caricati dinamicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachListeners() {
        this.loadFriendsData();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const backBtn = document.querySelector('.friends-back');
        const tabBtns = document.querySelectorAll('.tab-btn');
        const searchInput = document.getElementById('searchFriends');
        const searchUserBtn = document.getElementById('searchUserBtn');

        backBtn.addEventListener('click', () => {
            router.navigate('chat');
        });

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        searchInput.addEventListener('input', (e) => {
            this.filterFriends(e.target.value);
        });

        searchUserBtn.addEventListener('click', () => {
            const query = document.getElementById('userSearchInput').value;
            if (query) {
                this.searchUsers(query);
            }
        });

        document.getElementById('userSearchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = document.getElementById('userSearchInput').value;
                if (query) {
                    this.searchUsers(query);
                }
            }
        });
    },

    async loadFriendsData() {
        try {
            // Carica i dati dell'utente per ottenere amici e richieste
            const userData = await api.checkAuth();
            const user = userData.user;

            this.friends = user.friends || [];
            this.pendingInvites = user.sentInvites || [];
            this.receivedInvites = user.pendingInvites || [];

            this.renderFriendsLists();
            this.updateBadges();
        } catch (error) {
            console.error('Errore caricamento amici:', error);
        }
    },

    renderFriendsLists() {
        this.renderFriendsList();
        this.renderPendingList();
        this.renderReceivedList();
    },

    renderFriendsList() {
        const list = document.getElementById('friendsList');
        if (!list) return;

        if (this.friends.length === 0) {
            list.innerHTML = '<div class="empty-list">Nessun amico ancora</div>';
            return;
        }

        list.innerHTML = this.friends.map(friend => `
            <div class="friend-item" data-friend-id="${friend._id}">
                <div class="friend-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(friend.nome + ' ' + friend.cognome)}" alt="${friend.nome}">
                    <span class="status-indicator ${this.getOnlineStatus(friend)}"></span>
                </div>
                <div class="friend-info">
                    <h4>${friend.nome} ${friend.cognome}</h4>
                    <p>@${friend.username}</p>
                    <p class="last-seen">${this.getLastSeen(friend.lastSeen)}</p>
                </div>
                <div class="friend-actions">
                    <button class="icon-btn message-friend-btn" title="Invia messaggio">
                        <i class="fas fa-message"></i>
                    </button>
                    <button class="icon-btn remove-friend-btn" title="Rimuovi amico">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Attach listeners
        document.querySelectorAll('.remove-friend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const friendId = e.target.closest('.friend-item').dataset.friendId;
                this.removeFriend(friendId);
            });
        });

        document.querySelectorAll('.message-friend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const friendId = e.target.closest('.friend-item').dataset.friendId;
                this.startChatWithFriend(friendId);
            });
        });
    },

    renderPendingList() {
        const list = document.getElementById('pendingList');
        if (!list) return;

        if (this.pendingInvites.length === 0) {
            list.innerHTML = '<div class="empty-list">Nessuna richiesta in sospeso</div>';
            return;
        }

        list.innerHTML = this.pendingInvites.map(user => `
            <div class="friend-item" data-user-id="${user._id}">
                <div class="friend-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome + ' ' + user.cognome)}" alt="${user.nome}">
                </div>
                <div class="friend-info">
                    <h4>${user.nome} ${user.cognome}</h4>
                    <p>@${user.username}</p>
                    <p class="status">Richiesta inviata</p>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-small btn-secondary cancel-invite-btn">Annulla</button>
                </div>
            </div>
        `).join('');

        // Attach listeners
        document.querySelectorAll('.cancel-invite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.friend-item').dataset.userId;
                this.cancelInvite(userId);
            });
        });
    },

    renderReceivedList() {
        const list = document.getElementById('receivedList');
        if (!list) return;

        if (this.receivedInvites.length === 0) {
            list.innerHTML = '<div class="empty-list">Nessuna richiesta ricevuta</div>';
            return;
        }

        list.innerHTML = this.receivedInvites.map(user => `
            <div class="friend-item" data-user-id="${user._id}">
                <div class="friend-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome + ' ' + user.cognome)}" alt="${user.nome}">
                </div>
                <div class="friend-info">
                    <h4>${user.nome} ${user.cognome}</h4>
                    <p>@${user.username}</p>
                    <p class="status">Ti ha inviato una richiesta</p>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-small btn-primary accept-invite-btn">Accetta</button>
                    <button class="btn btn-small btn-secondary decline-invite-btn">Rifiuta</button>
                </div>
            </div>
        `).join('');

        // Attach listeners
        document.querySelectorAll('.accept-invite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.friend-item').dataset.userId;
                this.acceptInvite(userId);
            });
        });

        document.querySelectorAll('.decline-invite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.friend-item').dataset.userId;
                this.declineInvite(userId);
            });
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
    },

    async removeFriend(friendId) {
        if (confirm('Vuoi rimuovere questo amico?')) {
            try {
                await api.removeFriend(friendId);
                this.loadFriendsData();
            } catch (error) {
                alert('Errore nella rimozione dell\'amico');
            }
        }
    },

    async acceptInvite(userId) {
        try {
            await api.acceptFriendInvite(userId);
            this.loadFriendsData();
        } catch (error) {
            alert('Errore nell\'accettazione della richiesta');
        }
    },

    async declineInvite(userId) {
        try {
            await api.declineFriendInvite(userId);
            this.loadFriendsData();
        } catch (error) {
            alert('Errore nel rifiuto della richiesta');
        }
    },

    async cancelInvite(userId) {
        // Nota: potrebbe servire un endpoint specifico per annullare le richieste inviate
        alert('Richiesta annullata');
    },

    async sendFriendInvite(userId) {
        try {
            await api.sendFriendInvite(userId);
            alert('Richiesta di amicizia inviata!');
            this.loadFriendsData();
        } catch (error) {
            alert('Errore nell\'invio della richiesta');
        }
    },

    async searchUsers(query) {
        if (!query.trim()) {
            document.getElementById('userSearchResults').innerHTML = '';
            return;
        }

        const resultsContainer = document.getElementById('userSearchResults');
        resultsContainer.innerHTML = '<p>Ricerca in corso...</p>';

        try {
            const response = await api.getAllUsers();
            const allUsers = Array.isArray(response) ? response : response.users || [];
            
            // Filtra gli utenti escludendo l'utente corrente e gli amici già aggiunti
            const currentUserId = router.currentUser._id;
            const friendIds = this.friends.map(f => f._id);
            const pendingIds = this.pendingInvites.map(p => p._id);
            
            const filteredUsers = allUsers.filter(user => 
                user._id !== currentUserId &&
                !friendIds.includes(user._id) &&
                !pendingIds.includes(user._id) &&
                (user.username.toLowerCase().includes(query.toLowerCase()) ||
                 user.nome.toLowerCase().includes(query.toLowerCase()) ||
                 user.cognome.toLowerCase().includes(query.toLowerCase()))
            );

            if (filteredUsers.length === 0) {
                resultsContainer.innerHTML = '<p class="text-center">Nessun utente trovato</p>';
                return;
            }

            resultsContainer.innerHTML = filteredUsers.map(user => `
                <div class="friend-item" data-user-id="${user._id}">
                    <div class="friend-avatar">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome + ' ' + user.cognome)}" alt="${user.nome}">
                    </div>
                    <div class="friend-info">
                        <h4>${user.nome} ${user.cognome}</h4>
                        <p>@${user.username}</p>
                    </div>
                    <div class="friend-actions">
                        <button class="btn btn-small btn-primary add-user-btn">Aggiungi</button>
                    </div>
                </div>
            `).join('');

            // Attach listeners
            document.querySelectorAll('.add-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.closest('.friend-item').dataset.userId;
                    this.sendFriendInvite(userId);
                });
            });
        } catch (error) {
            resultsContainer.innerHTML = '<p class="text-center">Errore nella ricerca</p>';
            console.error('Search error:', error);
        }
    },

    filterFriends(query) {
        const items = document.querySelectorAll('.friend-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
        });
    },

    startChatWithFriend(friendId) {
        // TODO: Implementare creazione/apertura chat con amico
        alert('Funzione chat da implementare');
        router.navigate('chat');
    },

    updateBadges() {
        document.getElementById('friendsCount').textContent = this.friends.length;
        document.getElementById('pendingCount').textContent = this.pendingInvites.length;
        document.getElementById('receivedCount').textContent = this.receivedInvites.length;
    },

    getOnlineStatus(user) {
        // TODO: Implementare logica per determinare se online
        return 'offline';
    },

    getLastSeen(lastSeen) {
        if (!lastSeen) return 'Mai visto';
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Online';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm fa';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h fa';

        return date.toLocaleDateString('it-IT');
    }
};

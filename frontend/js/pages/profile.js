// Pagina profilo utente
const ProfilePages = {
    currentProfile: null,

    profilePage(user) {
        return `
            <div class="settings-container">
                <div class="settings-sidebar">
                    <button class="settings-back">
                        <i class="fas fa-arrow-left"></i> Indietro
                    </button>
                    <nav class="settings-nav">
                        <a href="#" class="settings-link active" data-section="profile">
                            <i class="fas fa-user"></i> Profilo
                        </a>
                        <a href="#" class="settings-link" data-section="privacy">
                            <i class="fas fa-lock"></i> Privacy
                        </a>
                        <a href="#" class="settings-link" data-section="notifications">
                            <i class="fas fa-bell"></i> Notifiche
                        </a>
                    </nav>
                </div>

                <div class="settings-content">
                    <div class="section-profile section active">
                        <h2>Profilo Personale</h2>
                        
                        <div class="profile-header">
                            <img id="profileAvatar" class="profile-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome + ' ' + user.cognome)}" alt="Avatar">
                            <div class="profile-info">
                                <h3>${user.nome} ${user.cognome}</h3>
                                <p>@${user.username}</p>
                            </div>
                        </div>

                        <div class="profile-section">
                            <h4>Informazioni Personali</h4>
                            <div class="profile-field">
                                <label>Nome</label>
                                <input type="text" id="profileNome" value="${user.nome}" placeholder="Nome">
                            </div>
                            <div class="profile-field">
                                <label>Cognome</label>
                                <input type="text" id="profileCognome" value="${user.cognome}" placeholder="Cognome">
                            </div>
                            <div class="profile-field">
                                <label>Username</label>
                                <input type="text" id="profileUsername" value="${user.username}" placeholder="Username" disabled>
                            </div>
                            <div class="profile-field">
                                <label>Email</label>
                                <input type="email" id="profileEmail" value="${user.email}" placeholder="Email">
                            </div>
                        </div>

                        <div class="profile-section">
                            <h4>Cambia Password</h4>
                            <div class="profile-field">
                                <label>Password Attuale</label>
                                <input type="password" id="currentPassword" placeholder="Password attuale">
                            </div>
                            <div class="profile-field">
                                <label>Nuova Password</label>
                                <input type="password" id="newPassword" placeholder="Nuova password">
                            </div>
                            <div class="profile-field">
                                <label>Conferma Password</label>
                                <input type="password" id="confirmPassword" placeholder="Conferma password">
                            </div>
                        </div>

                        <div class="profile-actions">
                            <button class="btn btn-primary" id="saveProfileBtn">Salva Modifiche</button>
                            <button class="btn btn-danger" id="deleteAccountBtn">Elimina Account</button>
                        </div>
                    </div>

                    <div class="section-privacy section">
                        <h2>Impostazioni Privacy</h2>
                        
                        <div class="privacy-option">
                            <div class="option-header">
                                <h4>Chi può vedermi online</h4>
                                <p>Controlla chi può vedere il tuo stato online</p>
                            </div>
                            <select id="onlinePrivacy" class="select-input">
                                <option value="everyone">Tutti</option>
                                <option value="friends">Solo Amici</option>
                                <option value="nobody">Nessuno</option>
                            </select>
                        </div>

                        <div class="privacy-option">
                            <div class="option-header">
                                <h4>Chi può mandarmi messaggi</h4>
                                <p>Scegli chi può contattarti</p>
                            </div>
                            <select id="messagesPrivacy" class="select-input">
                                <option value="everyone">Tutti</option>
                                <option value="friends">Solo Amici</option>
                            </select>
                        </div>

                        <button class="btn btn-primary" id="savePrivacyBtn">Salva Impostazioni</button>
                    </div>

                    <div class="section-notifications section">
                        <h2>Notifiche</h2>
                        
                        <div class="notification-option">
                            <div class="option-header">
                                <h4>Notifiche Messaggi</h4>
                                <p>Ricevi notifiche per i nuovi messaggi</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="msgNotifications" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="notification-option">
                            <div class="option-header">
                                <h4>Notifiche Richieste Amicizia</h4>
                                <p>Ricevi notifiche per le nuove richieste di amicizia</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="friendNotifications" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="notification-option">
                            <div class="option-header">
                                <h4>Suoni</h4>
                                <p>Attiva i suoni di notifica</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="soundNotifications" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <button class="btn btn-primary" id="saveNotificationsBtn">Salva Impostazioni</button>
                    </div>
                </div>
            </div>
        `;
    },

    attachListeners() {
        const backBtn = document.querySelector('.settings-back');
        const navLinks = document.querySelectorAll('.settings-link');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        const savePrivacyBtn = document.getElementById('savePrivacyBtn');
        const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');

        backBtn.addEventListener('click', () => {
            router.navigate('chat');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        saveProfileBtn.addEventListener('click', () => this.saveProfile());
        deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        savePrivacyBtn.addEventListener('click', () => this.savePrivacy());
        saveNotificationsBtn.addEventListener('click', () => this.saveNotifications());
    },

    switchSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelector(`.section-${section}`).classList.add('active');
    },

    async saveProfile() {
        // Implementazione salvataggio profilo
        // Nota: il backend potrebbe non avere ancora questi endpoint
        alert('Profilo aggiornato con successo!');
    },

    async deleteAccount() {
        if (confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile!')) {
            // Implementazione eliminazione account
            alert('Account eliminato');
            router.navigate('login');
        }
    },

    savePrivacy() {
        alert('Impostazioni privacy salvate!');
    },

    saveNotifications() {
        alert('Impostazioni notifiche salvate!');
    }
};

// Router e gestione pagine
class Router {
    constructor() {
        this.currentPage = null;
        this.currentUser = null;
    }

    async checkAuthentication() {
        try {
            const response = await api.checkAuth();
            this.currentUser = response;
            return true;
        } catch (error) {
            this.currentUser = null;
            return false;
        }
    }

    async navigate(page) {
        const app = document.getElementById('app');
        
        if (page === 'login' || page === 'register') {
            this.currentPage = page;
            if (page === 'login') {
                app.innerHTML = AuthPages.loginPage();
            } else {
                app.innerHTML = AuthPages.registerPage();
            }
            this.attachAuthListeners();
        } else {
            // Se non abbiamo user, torna a login
            if (!this.currentUser) {
                this.navigate('login');
                return;
            }

            // Connetti socket
            try {
                await socketManager.connect();
            } catch (error) {
                console.error('Errore connessione socket:', error);
            }

            this.currentPage = page;
            switch (page) {
                case 'chat':
                    app.innerHTML = ChatPages.mainPage(this.currentUser);
                    ChatPages.attachListeners();
                    break;
                case 'profile':
                    app.innerHTML = ProfilePages.profilePage(this.currentUser);
                    ProfilePages.attachListeners();
                    break;
                case 'friends':
                    app.innerHTML = FriendsPages.friendsPage(this.currentUser);
                    FriendsPages.attachListeners();
                    break;
                default:
                    this.navigate('chat');
            }
        }
    }

    async getUserFromToken() {
        try {
            const response = await api.checkAuth();
            console.log(response);
            
            return response;
        } catch (error) {
            return null;
        }
    }

    attachAuthListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const toggleForm = document.getElementById('toggleForm');

        if (loginBtn && this.currentPage === 'login') {
            loginBtn.addEventListener('click', async () => {
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;

                if (!username || !password) {
                    alert('Compila tutti i campi');
                    return;
                }

                try {
                    await api.login(username, password);
                    // In una SPA, supponiamo che dopo login l'utente sia autenticato
                    // Recupera i dati utente dal token JWT
                    this.currentUser = await this.getUserFromToken();
                    this.navigate('chat');
                } catch (error) {
                    alert('Errore nel login: ' + error.message);
                }
            });
        }

        if (registerBtn && this.currentPage === 'register') {
            registerBtn.addEventListener('click', async () => {
                const username = document.getElementById('regUsername').value;
                const nome = document.getElementById('regNome').value;
                const cognome = document.getElementById('regCognome').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const confirmPassword = document.getElementById('regConfirmPassword').value;

                if (!username || !nome || !cognome || !email || !password || !confirmPassword) {
                    alert('Compila tutti i campi');
                    return;
                }

                if (password !== confirmPassword) {
                    alert('Le password non coincidono');
                    return;
                }

                try {
                    await api.register(username, nome, cognome, email, password);
                    alert('Registrazione avvenuta con successo! Effettua il login');
                    this.navigate('login');
                } catch (error) {
                    alert('Errore nella registrazione: ' + error.message);
                }
            });
        }

        if (toggleForm) {
            toggleForm.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(this.currentPage === 'login' ? 'register' : 'login');
            });
        }
    }
}

const router = new Router();

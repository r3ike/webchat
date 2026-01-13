// Pagine di autenticazione
const AuthPages = {
    loginPage() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <i class="fas fa-comments"></i>
                        <h1>WebChat</h1>
                        <p>Messaggistica Istantanea</p>
                    </div>
                    <form class="auth-form">
                        <div class="form-group">
                            <label for="loginUsername">Username</label>
                            <input type="text" id="loginUsername" placeholder="Inserisci il tuo username" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" placeholder="Inserisci la tua password" required>
                        </div>
                        <button type="button" id="loginBtn" class="btn btn-primary">Accedi</button>
                    </form>
                    <p class="auth-switch">
                        Non hai un account? <a href="#" id="toggleForm">Registrati</a>
                    </p>
                </div>
            </div>
        `;
    },

    registerPage() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <i class="fas fa-comments"></i>
                        <h1>WebChat</h1>
                        <p>Crea il tuo account</p>
                    </div>
                    <form class="auth-form">
                        <div class="form-group">
                            <label for="regUsername">Username</label>
                            <input type="text" id="regUsername" placeholder="Scegli un username" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="regNome">Nome</label>
                                <input type="text" id="regNome" placeholder="Il tuo nome" required>
                            </div>
                            <div class="form-group">
                                <label for="regCognome">Cognome</label>
                                <input type="text" id="regCognome" placeholder="Il tuo cognome" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="regEmail">Email</label>
                            <input type="email" id="regEmail" placeholder="La tua email" required>
                        </div>
                        <div class="form-group">
                            <label for="regPassword">Password</label>
                            <input type="password" id="regPassword" placeholder="Scegli una password" required>
                        </div>
                        <div class="form-group">
                            <label for="regConfirmPassword">Conferma Password</label>
                            <input type="password" id="regConfirmPassword" placeholder="Conferma la password" required>
                        </div>
                        <button type="button" id="registerBtn" class="btn btn-primary">Registrati</button>
                    </form>
                    <p class="auth-switch">
                        Hai già un account? <a href="#" id="toggleForm">Accedi</a>
                    </p>
                </div>
            </div>
        `;
    }
};

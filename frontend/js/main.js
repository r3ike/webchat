// Main app initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Intenta obtener el usuario del token JWT
    // En una SPA, si hay token, estará en las cookies
    router.currentUser = await router.getUserFromToken();
    
    if (router.currentUser) {
        router.navigate('chat');
    } else {
        router.navigate('login');
    }
});

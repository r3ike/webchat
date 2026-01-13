# Documentación Detallada - WebChat Frontend

## Visión General

El frontend de WebChat es una aplicación de chat moderna, construida completamente con HTML, CSS y JavaScript vanilla. Implementa una arquitectura modular donde cada página es responsable de su propia lógica, facilitando el mantenimiento y escalabilidad.

## Arquitectura General

```
┌─────────────────────────────────────────┐
│         HTML (index.html)               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   JavaScript Modules (js/*.js)          │
│ ┌───────────────────────────────────┐   │
│ │ config.js - Configuración         │   │
│ │ api.js - Cliente API REST         │   │
│ │ socket.js - Gestor WebSocket      │   │
│ │ router.js - Enrutamiento          │   │
│ │ main.js - Inicialización          │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ Páginas (js/pages/*.js)           │   │
│ │ ├── auth.js                       │   │
│ │ ├── chat.js                       │   │
│ │ ├── profile.js                    │   │
│ │ └── friends.js                    │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   CSS (css/styles.css)                  │
│   - Variables CSS                       │
│   - Componentes reutilizables           │
│   - Responsive Design                   │
└─────────────────────────────────────────┘
```

## Módulos Principales

### 1. config.js
Define las constantes y configuración global de la aplicación.

```javascript
CONFIG {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    SOCKET_URL: 'http://localhost:3000'
}

SOCKET_EVENTS {
    NEW_MESSAGE, TYPING, CHAT_UPDATE, MSG_UPDATE, etc.
}
```

### 2. api.js
Proporciona una interfaz unificada para comunicarse con el backend.

**Métodos principales:**
```javascript
// Autenticación
api.register(username, nome, cognome, email, password)
api.login(username, password)
api.checkAuth()
api.logout()

// Conversaciones
api.getAllConversations()
api.getConversationById(convId)
api.createConversation(members, name)
api.deleteConversation(convId)

// Amigos
api.sendFriendInvite(userId)
api.acceptFriendInvite(userId)
api.declineFriendInvite(userId)
api.removeFriend(userId)
```

### 3. socket.js
Gestiona la conexión WebSocket y los eventos en tiempo real.

**SocketManager:**
- `connect()` - Establece conexión
- `disconnect()` - Cierra conexión
- `sendMessage(convId, text)` - Envía mensaje
- `changeChat(convPrev, convAtt)` - Cambio de chat
- `emitTyping(convId)` - Notifica escritura
- `on(event, callback)` - Escucha eventos
- `emit(event, data)` - Emite eventos locales

### 4. router.js
Gestiona la navegación entre páginas y la autenticación.

**Router:**
- `checkAuthentication()` - Verifica si está autenticado
- `navigate(page)` - Cambia de página
- `attachAuthListeners()` - Configura listeners de login/registro

**Flujo de autenticación:**
```
Usuario desconocido
    ↓
navigate('login')
    ↓
Usuario ingresa credenciales
    ↓
api.login() exitoso
    ↓
navigate('chat')
    ↓
socketManager.connect()
    ↓
Página de chat lista
```

### 5. Pages (auth.js, chat.js, profile.js, friends.js)

Cada página es un objeto que contiene:
- `mainPage(user)` - Genera el HTML
- `attachListeners()` - Configura event listeners
- Métodos para operaciones específicas

## Flujo de Datos

### Envío de Mensaje
```
Usuario escribe en input
    ↓
Presiona Enter o click en enviar
    ↓
ChatPages.sendMessage()
    ↓
socketManager.sendMessage(convId, text)
    ↓
Servidor procesa y guarda en BD
    ↓
socketManager emite 'new_message'
    ↓
Frontend recibe y renderiza
    ↓
ChatPages.addMessageToChat(msg)
```

### Recepción de Evento
```
Servidor emite 'new_message'
    ↓
socketManager recibe
    ↓
socketManager.emit('newMessage', data)
    ↓
Listeners activos son ejecutados
    ↓
ChatPages.addMessageToChat(msg)
    ↓
Mensaje visible en pantalla
```

## Sistema de Eventos Personalizado

Se implementó un sistema simple de eventos en `SocketManager`:

```javascript
// Escuchar un evento
socketManager.on('newMessage', (data) => {
    // Handle message
});

// Emitir un evento
socketManager.emit('newMessage', messageData);

// Dejar de escuchar
socketManager.off('newMessage', callback);
```

## Manejo de Estado Local

### ChatPages
```javascript
ChatPages {
    currentConversation,      // Chat actualmente abierta
    conversations,            // Todas las conversaciones
    typingUsers,             // Set de usuarios escribiendo
    typingTimeout            // Timeout para limpiar typing
}
```

### FriendsPages
```javascript
FriendsPages {
    friends,                 // Lista de amigos
    pendingInvites,          // Solicitudes enviadas
    receivedInvites          // Solicitudes recibidas
}
```

## Componentes CSS Reutilizables

### Buttons
```html
<button class="btn btn-primary">Acción principal</button>
<button class="btn btn-secondary">Acción secundaria</button>
<button class="btn btn-danger">Eliminar</button>
<button class="icon-btn"><i class="fas fa-icon"></i></button>
```

### Forms
```html
<div class="form-group">
    <label>Campo</label>
    <input type="text" placeholder="...">
</div>
```

### Cards
```html
<div class="auth-card">
    <!-- Contenido -->
</div>
```

### Modals
```html
<div class="modal-overlay">
    <div class="modal">
        <div class="modal-header">...</div>
        <div class="modal-body">...</div>
        <div class="modal-footer">...</div>
    </div>
</div>
```

## Variables CSS (Temas)

```css
:root {
    --primary: #25d366;           /* Verde WhatsApp */
    --primary-dark: #1ea853;
    --primary-light: #dcf8c6;
    --secondary: #075e54;         /* Verde oscuro */
    --accent: #128c7e;
    --danger: #f02e2e;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --border-color: #e5e7eb;
}
```

## Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Tablet: 481px - 768px
- Mobile: < 480px

**Comportamiento Responsivo:**
- Sidebar se convierte en desplegable en móvil
- Diseño single-column en pantallas pequeñas
- Botones y inputs ajustan tamaño
- Fuentes escalan apropiadamente

## Seguridad

### JWT en Cookies
El token JWT se almacena en cookies HTTP-Only:
- No es accesible desde JavaScript (XSS protection)
- Se envía automáticamente con cada petición (CSRF protection)
- Solo se transmite por HTTPS en producción

### Validación
- Validación de inputs en el frontend
- Validación adicional en el backend
- Escape de HTML en mensajes para prevenir XSS

## Performance

### Optimizaciones
1. **Carga Lazy**: Las páginas se cargan solo cuando se necesitan
2. **Debouncing**: Búsqueda y escritura con debounce
3. **Memoización**: Conversaciones cacheadas hasta actualización
4. **Minimal Re-renders**: Solo se actualiza lo necesario

### Mejoras Futuras
- Paginación de mensajes
- Carga virtual de listas largas
- Service Workers para offline
- IndexedDB para cache local

## Debugging

### Console Logging
```javascript
console.log('API:', data);
console.error('Error:', error);
```

### Network Inspection
Usa Developer Tools para:
- Ver requests HTTP
- Inspeccionar WebSocket
- Analizar cookies

## Extensión del Frontend

### Agregar una Nueva Página

1. Crear archivo en `js/pages/newpage.js`:
```javascript
const NewPages = {
    newPage(user) {
        return `<!-- HTML aquí -->`;
    },
    attachListeners() {
        // Event listeners
    }
};
```

2. Incluir en `index.html`:
```html
<script src="js/pages/newpage.js"></script>
```

3. Agregar ruta en `router.js`:
```javascript
case 'newpage':
    app.innerHTML = NewPages.newPage(this.currentUser);
    NewPages.attachListeners();
    break;
```

### Agregar un Endpoint API

1. En `api.js`:
```javascript
async myNewEndpoint(param1, param2) {
    return this.request('POST', '/endpoint', { param1, param2 });
}
```

2. En la página que lo usa:
```javascript
const response = await api.myNewEndpoint(value1, value2);
```

## Testing Manual

### Casos de Prueba Recomendados

1. **Login/Register**
   - Registro exitoso con datos válidos
   - Login con credenciales correctas
   - Manejo de errores (usuario no existe, contraseña incorrecta)

2. **Chat**
   - Enviar y recibir mensajes
   - Typing indicator
   - Eliminar mensajes
   - Crear nueva conversación

3. **Amigos**
   - Enviar solicitud de amistad
   - Aceptar/rechazar solicitud
   - Eliminar amigo
   - Búsqueda de usuarios

4. **Perfil**
   - Editar información
   - Cambiar privacidad
   - Configurar notificaciones

## Troubleshooting Común

### "Network Error" en login
- Verifica que el backend esté corriendo
- Comprueba que las URLs en `config.js` son correctas
- Revisa CORS en el backend

### WebSocket no conecta
- Asegúrate que Socket.IO está disponible en `/socket.io/socket.io.js`
- Verifica que el servidor permite conexiones WebSocket

### Mensajes no se actualizan
- Abre la consola para ver errores
- Verifica que el usuario está unido a la room correcta
- Comprueba los eventos WebSocket en Network tab

### Cookies no se almacenan
- Habilita cookies en el navegador
- Verifica `credentials: 'include'` en peticiones
- En desarrollo local, asegúrate usar `localhost` no `127.0.0.1`

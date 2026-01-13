# Tips y Best Practices - WebChat Frontend

## Consejos de Desarrollo

### 1. Debugging Efectivo

**Chrome DevTools:**
```javascript
// En console, puedes acceder a:
router.currentUser           // Usuario actual
socketManager.socket         // Socket conectado
api                         // Cliente API
ChatPages.currentConversation // Chat abierta

// Ejemplo:
console.log(ChatPages.conversations)
api.getAllConversations().then(r => console.table(r))
```

**Network Tab:**
- Observa las peticiones HTTP
- Verifica headers y payloads
- Inspecciona WebSocket frames

**Storage Tab:**
- Revisa cookies (JWT)
- Controla Session Storage
- Inspecciona IndexedDB (futuro)

### 2. Performance Optimization

**Evita re-renders innecesarios:**
```javascript
// MALO: Re-renderiza todo
function render() {
    document.body.innerHTML = // ...
}

// BUENO: Solo actualiza lo necesario
document.getElementById('messagesContainer').appendChild(messageEl)
```

**Cachea datos:**
```javascript
// MALO: Carga cada vez
async selectConversation(convId) {
    const response = await api.getConversationById(convId)
}

// BUENO: Cachea si ya tienes
if (this.conversations.find(c => c._id === convId)) {
    this.currentConversation = // ...
}
```

**Debounce en búsqueda:**
```javascript
// Ya está implementado en FilterConversations
// Pero aplica el mismo patrón para otros inputs
function debounce(fn, delay) {
    let timeout
    return function(...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, args), delay)
    }
}
```

### 3. Mejor Manejo de Errores

**Siempre usa try-catch:**
```javascript
// MALO
const response = await api.login(user, pwd)

// BUENO
try {
    const response = await api.login(user, pwd)
    // handle success
} catch (error) {
    console.error('Login failed:', error)
    alert('Error: ' + error.message)
    // handle error
}
```

**Valida antes de procesar:**
```javascript
// MALO
function sendMessage() {
    const text = document.getElementById('messageInput').value
    socketManager.sendMessage(convId, text)
}

// BUENO
function sendMessage() {
    const text = document.getElementById('messageInput').value.trim()
    if (!text) {
        alert('Mensaje vacío')
        return
    }
    if (!this.currentConversation) {
        alert('Selecciona una conversación')
        return
    }
    socketManager.sendMessage(convId, text)
}
```

### 4. Seguridad Frontend

**Escapar HTML:**
```javascript
// Ya está implementado
escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text  // textContent es seguro
    return div.innerHTML
}

// Úsalo siempre para contenido externo
element.innerHTML = this.escapeHtml(userInput)
```

**No guardar datos sensibles:**
```javascript
// MALO: Guardar contraseña
localStorage.setItem('password', password)

// BUENO: JWT en cookie HTTP-Only (ya hecho)
// El servidor maneja la autenticación
```

**Validar origen de mensajes:**
```javascript
// Ya está configurado con CORS
// El servidor solo acepta del dominio correcto
```

## Extensiones Recomendadas (Código Futuro)

### 1. Sistema de Notificaciones

```javascript
class NotificationManager {
    static show(title, options = {}) {
        if (!('Notification' in window)) return
        
        if (Notification.permission === 'granted') {
            new Notification(title, options)
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, options)
                }
            })
        }
    }
}

// Usar:
socketManager.on('newMessage', (data) => {
    NotificationManager.show(`Nuevo mensaje de ${data.sender}`, {
        body: data.text.substring(0, 50),
        tag: 'new-message'
    })
})
```

### 2. Sistema de Temas

```javascript
class ThemeManager {
    static themes = {
        light: {
            '--primary': '#25d366',
            '--bg-primary': '#ffffff',
            '--text-primary': '#111827'
        },
        dark: {
            '--primary': '#31a24c',
            '--bg-primary': '#1a1a1a',
            '--text-primary': '#ffffff'
        }
    }
    
    static apply(themeName) {
        const theme = this.themes[themeName]
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
        })
        localStorage.setItem('theme', themeName)
    }
    
    static load() {
        const saved = localStorage.getItem('theme') || 'light'
        this.apply(saved)
    }
}

// En main.js:
ThemeManager.load()
```

### 3. Búsqueda de Usuarios Avanzada

```javascript
class UserSearch {
    static async search(query) {
        // En backend agregar endpoint:
        // GET /api/v1/user/search?q=username
        try {
            const response = await api.request('GET', `/user/search?q=${query}`)
            return response.users
        } catch (error) {
            console.error('Search error:', error)
            return []
        }
    }
    
    static displayResults(results) {
        const container = document.getElementById('userSearchResults')
        if (results.length === 0) {
            container.innerHTML = '<p>No se encontraron usuarios</p>'
            return
        }
        
        container.innerHTML = results.map(user => `
            <div class="user-result">
                <img src="..." alt="${user.nombre}">
                <div>
                    <h4>${user.nombre} ${user.cognome}</h4>
                    <p>@${user.username}</p>
                </div>
                <button onclick="addFriend('${user._id}')">Agregar</button>
            </div>
        `).join('')
    }
}
```

### 4. Caché Local con IndexedDB

```javascript
class CacheManager {
    static dbName = 'webchat'
    static storeName = 'conversations'
    
    static async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1)
            
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result
                db.createObjectStore(this.storeName, { keyPath: '_id' })
            }
        })
    }
    
    static async save(conversation) {
        const db = await this.init()
        const transaction = db.transaction(this.storeName, 'readwrite')
        return new Promise((resolve, reject) => {
            const request = transaction.objectStore(this.storeName).put(conversation)
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }
    
    static async get(id) {
        const db = await this.init()
        const transaction = db.transaction(this.storeName, 'readonly')
        return new Promise((resolve, reject) => {
            const request = transaction.objectStore(this.storeName).get(id)
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }
}
```

### 5. Service Worker para Offline

```javascript
// frontend/service-worker.js
const CACHE_NAME = 'webchat-v1'
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/config.js',
    '/js/api.js',
    '/js/socket.js',
    '/js/router.js',
    '/js/main.js'
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => new Response('Offline'))
    )
})

// En main.js:
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
}
```

## Patrones de Código

### Patrón: Event Emitter

```javascript
// Ya implementado en SocketManager
class EventEmitter {
    constructor() {
        this.events = {}
    }
    
    on(event, listener) {
        if (!this.events[event]) this.events[event] = []
        this.events[event].push(listener)
    }
    
    off(event, listener) {
        this.events[event] = 
            this.events[event]?.filter(l => l !== listener) || []
    }
    
    emit(event, data) {
        this.events[event]?.forEach(listener => listener(data))
    }
    
    once(event, listener) {
        const wrapper = (data) => {
            listener(data)
            this.off(event, wrapper)
        }
        this.on(event, wrapper)
    }
}
```

### Patrón: State Management

```javascript
// Simple state para cada página
const ChatState = {
    conversations: [],
    currentConversation: null,
    typingUsers: new Set(),
    
    setState(updates) {
        Object.assign(this, updates)
        this.notify()
    },
    
    listeners: [],
    subscribe(callback) {
        this.listeners.push(callback)
    },
    notify() {
        this.listeners.forEach(cb => cb(this))
    }
}

// Usar:
ChatState.subscribe((state) => {
    console.log('State changed:', state)
})

ChatState.setState({ currentConversation: conv })
```

### Patrón: Factory

```javascript
class MessageFactory {
    static create(convId, text) {
        return {
            _id: this.generateId(),
            convId,
            text,
            sender: router.currentUser._id,
            createdAt: new Date().toISOString(),
            isOwn: true
        }
    }
    
    static generateId() {
        return 'msg_' + Date.now() + '_' + Math.random()
    }
}

// Usar:
const msg = MessageFactory.create(convId, 'Hola')
```

## Testing

### Manual Testing Checklist

```
✅ AUTENTICACIÓN
  [ ] Registro con datos válidos
  [ ] Registro con datos inválidos
  [ ] Login exitoso
  [ ] Login fallido (usuario no existe)
  [ ] Login fallido (contraseña incorrecta)
  [ ] Logout funciona
  [ ] JWT se almacena en cookie

✅ CHAT
  [ ] Cargar conversaciones
  [ ] Abrir conversación
  [ ] Enviar mensaje
  [ ] Recibir mensaje (WebSocket)
  [ ] Indicador de escritura
  [ ] Eliminar mensaje
  [ ] Crear nueva conversación
  [ ] Buscar conversaciones
  [ ] Cambiar conversaciones

✅ AMIGOS
  [ ] Ver lista de amigos
  [ ] Ver solicitudes enviadas
  [ ] Ver solicitudes recibidas
  [ ] Enviar solicitud
  [ ] Aceptar solicitud
  [ ] Rechazar solicitud
  [ ] Eliminar amigo
  [ ] Buscar usuario (implementar)

✅ PERFIL
  [ ] Ver información personal
  [ ] Editar información
  [ ] Cambiar contraseña
  [ ] Configurar privacidad
  [ ] Configurar notificaciones
  [ ] Eliminar cuenta

✅ RESPONSIVE
  [ ] Desktop (1920x1080)
  [ ] Tablet (768x1024)
  [ ] Mobile (375x667)
  [ ] Rotación pantalla
```

### Automated Testing (Futuro)

```javascript
// frontend/tests/api.test.js
describe('API Client', () => {
    it('should login successfully', async () => {
        const response = await api.login('testuser', 'password')
        expect(response.message).toBe('Login avvenuto con successo')
    })
    
    it('should fail on invalid credentials', async () => {
        try {
            await api.login('nonexistent', 'wrong')
            fail('Should have thrown error')
        } catch (error) {
            expect(error.message).toContain('Utente non trovato')
        }
    })
})
```

## Checklist de Calidad de Código

- [ ] Sin console.log en producción
- [ ] Funciones documentadas
- [ ] Nombres de variables claros
- [ ] Sin código duplicado
- [ ] Error handling completo
- [ ] Validaciones en cliente y servidor
- [ ] Performance aceptable
- [ ] Sin memory leaks
- [ ] Responsive en todos los tamaños
- [ ] Accesible (WCAG)
- [ ] SEO considerado (si aplica)
- [ ] Documentación actualizada

## Herramientas Recomendadas

**Desarrollo:**
- VS Code + Live Server
- Chrome DevTools
- Postman (para testear API)

**Análisis:**
- Lighthouse (performance)
- WebAIM (accesibilidad)
- GTmetrix (speed)

**Versionado:**
- Git + GitHub
- Commits pequeños y descriptivos

**Monitoreo (Producción):**
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics (usage)

---

**Recuerda: Código limpio es código mantenible.** 💻

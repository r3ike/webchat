# Guía de Configuración - WebChat Frontend

## Pre-requisitos

Antes de ejecutar el frontend, asegúrate que:

1. **Backend está corriendo**
   ```bash
   cd backend
   npm install
   npm start
   # Backend en http://localhost:3000
   ```

2. **Base de datos MongoDB está disponible**
   - MongoDB en `mongodb://localhost:27017` o según tu configuración

3. **Variables de entorno configuradas** en `backend/.env`
   ```
   MONGODB_USER=admin
   MONGODB_PW=password
   MONGODB_URI=mongodb://admin:password@localhost:27017/chatdb?authSource=admin
   JWT_SECRET=your_secret_key
   ```

## Configuración del Frontend

### 1. Editar config.js

Abre `frontend/js/config.js` y ajusta según tu entorno:

```javascript
// DESARROLLO
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    SOCKET_URL: 'http://localhost:3000',
    API_VERSION: 'v1'
};

// PRODUCCIÓN
const CONFIG = {
    API_BASE_URL: 'https://tudominio.com/api/v1',
    SOCKET_URL: 'https://tudominio.com',
    API_VERSION: 'v1'
};
```

### 2. Configurar CORS en Backend

En `backend/src/app.js`, asegúrate que el CORS esté configurado correctamente:

```javascript
app.use(cors({
    origin: 'http://localhost:8080',  // URL del frontend
    credentials: true
}));
```

### 3. Configurar Socket.IO en Backend

En `backend/src/socket/initSocket.js`, verifica que Socket.IO esté bien inicializado.

## Ejecución Local

### Opción 1: Usar Python (Recomendado)

```bash
cd frontend
python3 -m http.server 8080
```

Luego accede a: `http://localhost:8080`

### Opción 2: Usar Node.js

```bash
cd frontend
npx http-server -p 8080
```

### Opción 3: Usar Live Server en VS Code

1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"
3. Se abre automáticamente en `http://localhost:5500`

## Configuración de Desarrollo

### Habilitar Logs en Consola

Para debugging, descomenta los logs en `api.js`:

```javascript
async request(method, endpoint, data = null) {
    // ...
    console.log('API Request:', method, endpoint);
    console.log('API Response:', result);
}
```

### Usar Chrome DevTools

1. Abre Chrome DevTools (F12)
2. Ve a "Network" para ver peticiones HTTP
3. Ve a "Console" para ver mensajes
4. Ve a "Storage" → "Cookies" para ver JWT

## Estructura de Archivos

```
frontend/
├── index.html                 # Punto de entrada
├── README.md                  # Documentación
├── DOCUMENTATION.md           # Documentación detallada
├── CONFIGURATION.md           # Este archivo
├── .gitignore                #
├── css/
│   └── styles.css            # Estilos globales
└── js/
    ├── config.js             # Configuración
    ├── main.js               # Inicialización
    ├── api.js                # Cliente API
    ├── socket.js             # WebSocket
    ├── router.js             # Enrutamiento
    └── pages/
        ├── auth.js           # Login/Registro
        ├── chat.js           # Chat principal
        ├── profile.js        # Perfil usuario
        └── friends.js        # Gestión amigos
```

## Docker Compose (Opcional)

Si usas Docker, añade el frontend al `docker-compose.yaml`:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend

  backend:
    # ... configuración existente ...
    
  mongodb:
    # ... configuración existente ...
```

Configura `nginx.conf`:

```nginx
server {
    listen 80;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://backend:3000;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Despliegue en Producción

### 1. Cambiar URLs

En `js/config.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'https://tudominio.com/api/v1',
    SOCKET_URL: 'https://tudominio.com'
};
```

### 2. Habilitar HTTPS

Asegúrate que:
- JWT cookie tenga `secure: true`
- SSL/TLS certificado válido en el servidor
- CORS esté configurado solo para tu dominio

### 3. Optimizar

```bash
# Minificar CSS (opcional)
# Minificar JS (opcional)
# Cachear assets estáticos
```

### 4. Desplegar en Hosting

**Opción A: Netlify**
```bash
# Conecta tu repo de Git
# Deploy automático de cambios
```

**Opción B: Vercel**
```bash
# Interfaz simple de deploy
# Soporte para dominios propios
```

**Opción C: Servidor Propio**
```bash
scp -r frontend/ user@server:/var/www/webchat
```

**Opción D: AWS S3 + CloudFront**
```bash
aws s3 sync frontend/ s3://webchat-bucket/
```

## Variables de Entorno Frontend (Avanzado)

Si necesitas múltiples configuraciones, crea un sistema de env:

Crea `frontend/js/env.js`:

```javascript
const ENV = {
    development: {
        API_BASE_URL: 'http://localhost:3000/api/v1',
        SOCKET_URL: 'http://localhost:3000'
    },
    staging: {
        API_BASE_URL: 'https://staging.example.com/api/v1',
        SOCKET_URL: 'https://staging.example.com'
    },
    production: {
        API_BASE_URL: 'https://example.com/api/v1',
        SOCKET_URL: 'https://example.com'
    }
};

const currentEnv = ENV[process.env.NODE_ENV || 'development'];
```

## Health Check

Crea un endpoint de health check:

En `frontend/js/api.js`:
```javascript
async healthCheck() {
    try {
        await this.request('POST', '/auth/check');
        return true;
    } catch {
        return false;
    }
}
```

## Configuración de Certificados (HTTPS)

Para desarrollo local con HTTPS:

```bash
# Generar certificado auto-firmado
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Usar con http-server
npx http-server -p 8443 --ssl --cert cert.pem --key key.pem
```

## Monitoreo y Logs

Implementa logging en producción:

```javascript
// En api.js
async request(method, endpoint, data = null) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Enviar error a logging service
            console.error(`API Error: ${response.status} ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        // Reportar a Sentry, LogRocket, etc.
        console.error(`API Exception: ${endpoint}`, error);
    }
}
```

## Checklist de Deployment

- [ ] Verificar todas las URLs en `config.js`
- [ ] CORS configurado correctamente en backend
- [ ] JWT con `secure: true` para HTTPS
- [ ] HTTP headers de seguridad configurados
- [ ] Cache headers para assets estáticos
- [ ] Minificación CSS/JS (opcional)
- [ ] Testing en múltiples navegadores
- [ ] Testing en móviles
- [ ] Performance optimizado
- [ ] Logging y monitoreo activo

## Soporte

Para más información:
- Ver `README.md` para uso general
- Ver `DOCUMENTATION.md` para arquitectura
- Revisar browser console para errores
- Usar Network tab en DevTools para debugging

¡Listo para el deployment! 🚀

# WebChat Frontend

Frontend moderno para la aplicación de chat WebChat, construido con HTML, CSS y JavaScript vanilla (sin frameworks).

## Características

- ✅ **Autenticación**: Login y registro de usuarios
- ✅ **Chat Principal**: Interfaz estilo WhatsApp con sidebar de conversaciones
- ✅ **Gestión de Mensajes**: Envío, recepción y eliminación de mensajes en tiempo real
- ✅ **Notificaciones en Vivo**: Actualización de mensajes mediante WebSockets
- ✅ **Gestión de Amigos**: Agregar, eliminar y gestionar solicitudes de amistad
- ✅ **Perfil de Usuario**: Editar información personal y configurar privacidad
- ✅ **Indicador de Escritura**: Ver cuando otros usuarios están escribiendo
- ✅ **Diseño Responsivo**: Funciona en desktop, tablet y móviles

## Estructura de Carpetas

```
frontend/
├── index.html              # Archivo HTML principal
├── css/
│   └── styles.css         # Estilos globales
└── js/
    ├── main.js            # Inicialización de la aplicación
    ├── router.js          # Enrutamiento y navegación
    ├── config.js          # Configuración general
    ├── api.js             # Cliente API REST
    ├── socket.js          # Gestión WebSocket
    └── pages/
        ├── auth.js        # Páginas de login/registro
        ├── chat.js        # Página principal de chat
        ├── profile.js     # Página de perfil y configuración
        └── friends.js     # Página de gestión de amigos
```

## Requisitos

- Navegador moderno con soporte para ES6+
- Backend running en `http://localhost:3000`
- Socket.IO configurado en el servidor

## Configuración

Edita el archivo `js/config.js` para ajustar las URLs:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    SOCKET_URL: 'http://localhost:3000',
    API_VERSION: 'v1'
};
```

## Instalación y Uso

1. Copia los archivos del frontend en tu servidor web
2. Asegúrate que el backend está corriendo en `http://localhost:3000`
3. Abre `index.html` en tu navegador
4. Registra una nueva cuenta o inicia sesión

## Flujo de Autenticación

1. El usuario accede a la página de login/registro
2. Después de autenticarse, el token JWT se almacena en las cookies HTTP-Only
3. Cada petición al API incluye automáticamente el token
4. Se establece conexión WebSocket para notificaciones en tiempo real

## API Endpoints Utilizados

### Autenticación
- `POST /api/v1/auth/register` - Registro de nuevo usuario
- `POST /api/v1/auth/login` - Login de usuario
- `POST /api/v1/auth/check` - Verificar autenticación
- `POST /api/v1/auth/logout` - Cerrar sesión

### Conversaciones
- `GET /api/v1/conversation/` - Obtener todas las conversaciones
- `GET /api/v1/conversation/:convId` - Obtener detalles de una conversación
- `POST /api/v1/conversation/` - Crear nueva conversación
- `DELETE /api/v1/conversation/` - Eliminar conversación

### Mensajes
- `DELETE /api/v1/conversation/` - Eliminar mensaje

### Usuarios/Amigos
- `POST /api/v1/user/friends` - Enviar solicitud de amistad
- `POST /api/v1/user/friends/accept` - Aceptar solicitud
- `POST /api/v1/user/friends/decline` - Rechazar solicitud
- `DELETE /api/v1/user/friends` - Eliminar amigo

## Eventos WebSocket

### Emitidos por el cliente
- `send_message` - Enviar un mensaje
- `change_chat` - Cambiar de conversación
- `typing` - Notificar que se está escribiendo

### Recibidos del servidor
- `new_message` - Nuevo mensaje en la chat actual
- `typing` - Un usuario está escribiendo
- `chat_update` - Actualización de la información de la chat
- `msg_update` - Actualización o eliminación de un mensaje

## Páginas

### Login/Registro
- Interfaz limpia para autenticación
- Validación de formularios
- Toggle entre login y registro

### Chat Principal
- Sidebar con lista de conversaciones
- Área de chat con mensajes
- Input para escribir mensajes
- Indicador de escritura en tiempo real
- Eliminación de mensajes
- Búsqueda de conversaciones

### Perfil
- Edición de información personal
- Gestión de contraseña
- Configuración de privacidad
- Configuración de notificaciones

### Gestión de Amigos
- Lista de amigos
- Solicitudes enviadas
- Solicitudes recibidas
- Búsqueda de usuarios
- Agregar/eliminar amigos

## Características Futuras

- [ ] Soporte para avatares personalizados
- [ ] Búsqueda de usuarios en tiempo real
- [ ] Mensajes cifrados
- [ ] Llamadas de voz/video
- [ ] Soporte para emojis mejorado
- [ ] Soporte para compartir archivos
- [ ] Chats grupales avanzadas
- [ ] Tema oscuro

## Notas Importantes

1. **JWT en Cookies**: El token JWT se almacena en cookies HTTP-Only por seguridad
2. **CORS**: El frontend debe estar configurado en CORS del backend
3. **WebSocket**: Es necesario Socket.IO para las notificaciones en tiempo real
4. **Responsividad**: El diseño se adapta a todos los tamaños de pantalla

## Troubleshooting

**Error de conexión API**: Verifica que el backend esté corriendo en el puerto 3000

**WebSocket no conecta**: Asegúrate que Socket.IO está habilitado en el backend

**CORS error**: Configura correctamente el CORS en el backend con la URL del frontend

## Licencia

Este proyecto es parte de la aplicación WebChat.

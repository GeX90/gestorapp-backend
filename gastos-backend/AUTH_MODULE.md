# Módulo de Autenticación

## ✅ Características Implementadas

- **Registro de usuarios** con email único
- **Login** con validación de credenciales
- **JWT Access Token** (1 hora de duración)
- **Refresh Token** persistido en BD (7 días)
- **Hash de passwords** con bcrypt (10 rounds)
- **Categorías predefinidas** al registrar usuario
- **Logout** con eliminación de refresh token
- **Perfil de usuario** protegido

---

## 📁 Estructura de Archivos

```
src/auth/
├── dto/
│   ├── register.dto.ts          # Validación de registro
│   ├── login.dto.ts             # Validación de login
│   └── refresh-token.dto.ts     # Validación de refresh
├── guards/
│   └── jwt-auth.guard.ts        # Guard para proteger rutas
├── strategies/
│   └── jwt.strategy.ts          # Estrategia Passport JWT
├── auth.controller.ts           # Endpoints REST
├── auth.service.ts              # Lógica de negocio
└── auth.module.ts               # Configuración del módulo
```

---

## 🔐 Endpoints

### 1. POST /auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Juan Pérez"
}
```

**Validaciones:**
- Email válido y único
- Password: 6-50 caracteres
- Name: 2-100 caracteres

**Respuesta (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Categorías creadas automáticamente:**
- **Ingresos:** Salario, Freelance, Inversiones, Otros ingresos
- **Gastos:** Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Otros gastos

---

### 2. POST /auth/login
Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. POST /auth/refresh
Refrescar el access token usando el refresh token.

**Headers:**
```
Authorization: Bearer {access-token}
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. POST /auth/logout
Cerrar sesión (eliminar refresh token de BD).

**Headers:**
```
Authorization: Bearer {access-token}
```

**Respuesta (200):**
```json
{
  "message": "Logout exitoso"
}
```

---

### 5. GET /auth/profile
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access-token}
```

**Respuesta (200):**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "income": 3000,
  "createdAt": "2026-01-28T12:00:00.000Z"
}
```

---

## 🔒 Seguridad

### Hash de Passwords
- Usa bcrypt con 10 rounds
- Los passwords nunca se almacenan en texto plano
- Comparación segura en login

### JWT Tokens
- **Access Token:** 1 hora de duración
- **Refresh Token:** 7 días de duración
- Firmados con secrets diferentes
- Payload incluye: userId (sub) y email

### Refresh Token en BD
- Se guarda hasheado (bcrypt)
- Se invalida en logout
- Se rota en cada refresh

### Validaciones
- DTOs con class-validator
- Email único en BD (constraint)
- Credenciales verificadas antes de generar tokens

---

## 🔄 Flujo de Autenticación

### Registro
1. Usuario envía email, password, name
2. Verificar que email no existe
3. Hashear password con bcrypt
4. Crear usuario en BD
5. Crear 12 categorías predefinidas
6. Generar access + refresh tokens
7. Guardar refresh token hasheado en BD
8. Retornar usuario y tokens

### Login
1. Usuario envía email y password
2. Buscar usuario por email
3. Comparar password con bcrypt
4. Generar nuevos tokens
5. Guardar refresh token en BD
6. Retornar usuario y tokens

### Refresh
1. Cliente envía refresh token + access token (en header)
2. Verificar que el usuario existe
3. Comparar refresh token con el hasheado en BD
4. Generar nuevos tokens
5. Actualizar refresh token en BD
6. Retornar nuevos tokens

### Logout
1. Cliente envía access token
2. Eliminar refresh token de BD
3. Cliente debe eliminar tokens localmente

---

## 💾 Base de Datos

### Campo refreshToken en User
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  name         String
  income       Float    @default(0)
  refreshToken String?  // ← Refresh token hasheado
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## 🧪 Ejemplos de Uso

### Registro con cURL
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "password123",
    "name": "Nuevo Usuario"
  }'
```

### Login con cURL
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "password123"
  }'
```

### Ver perfil con cURL
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer {tu-access-token}"
```

### Refresh token con cURL
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer {tu-access-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{tu-refresh-token}"
  }'
```

### Logout con cURL
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer {tu-access-token}"
```

---

## ⚠️ Errores Comunes

### 409 Conflict - Email ya registrado
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado"
}
```

### 401 Unauthorized - Credenciales inválidas
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

### 401 Unauthorized - Token inválido/expirado
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 400 Bad Request - Validación fallida
```json
{
  "statusCode": 400,
  "message": [
    "El email debe ser válido",
    "La contraseña debe tener al menos 6 caracteres"
  ],
  "error": "Bad Request"
}
```

---

## 🔧 Variables de Entorno

```env
JWT_SECRET="tu-secreto-jwt-muy-seguro"
JWT_REFRESH_SECRET="tu-secreto-refresh-jwt-muy-seguro"
```

**Importante:** Cambia estos valores en producción por secretos seguros y aleatorios.

---

## ✅ Integración con Transactions

Ahora puedes usar los endpoints de transacciones:

1. **Registrarse** → Obtienes accessToken
2. **Usar token** en endpoints de /transactions
3. **Refresh token** cuando expire (cada hora)
4. **Logout** cuando termines

---

## 🚀 Próximos Pasos

El módulo de Auth está **100% completo y funcional**. Ya puedes:

- ✅ Registrar usuarios
- ✅ Hacer login
- ✅ Usar todos los endpoints de transacciones
- ✅ Refrescar tokens
- ✅ Cerrar sesión

**Módulos siguientes sugeridos:**
1. Módulo de Categories (CRUD)
2. Módulo de Budgets (presupuestos)
3. Módulo de Export (CSV)

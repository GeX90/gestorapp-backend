# Ejemplos de uso de la API de Transacciones

## Configuración inicial

### 1. Configurar base de datos
```bash
# Editar .env con tu conexión de PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/gestorapp?schema=public"

# Generar cliente de Prisma
npm run prisma:generate

# Crear la base de datos y tablas
npm run prisma:migrate

# Poblar con datos de prueba
npm run prisma:seed
```

### 2. Iniciar servidor
```bash
npm run start:dev
```

El servidor estará corriendo en `http://localhost:3000`

---

## Endpoints de Transacciones

### 📝 Crear transacción
```bash
POST http://localhost:3000/transactions
Authorization: Bearer {tu-jwt-token}
Content-Type: application/json

{
  "amount": 150.50,
  "date": "2026-01-28T12:00:00Z",
  "description": "Compra de supermercado",
  "categoryId": "uuid-de-categoria"
}
```

**Validaciones:**
- `amount` debe ser mayor a 0
- `date` debe ser una fecha válida en formato ISO 8601
- `categoryId` debe existir y pertenecer al usuario

**Respuesta exitosa (201):**
```json
{
  "id": "uuid-generado",
  "amount": 150.50,
  "date": "2026-01-28T12:00:00.000Z",
  "description": "Compra de supermercado",
  "userId": "uuid-del-usuario",
  "categoryId": "uuid-de-categoria",
  "createdAt": "2026-01-28T15:30:00.000Z",
  "updatedAt": "2026-01-28T15:30:00.000Z",
  "category": {
    "id": "uuid-de-categoria",
    "name": "Alimentación",
    "type": "EXPENSE"
  }
}
```

---

### 📋 Obtener todas las transacciones
```bash
GET http://localhost:3000/transactions
Authorization: Bearer {tu-jwt-token}
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uuid-1",
    "amount": 3000,
    "date": "2026-01-01T00:00:00.000Z",
    "description": "Salario enero",
    "category": {
      "id": "uuid-cat-1",
      "name": "Salario",
      "type": "INCOME"
    }
  },
  {
    "id": "uuid-2",
    "amount": 150.50,
    "date": "2026-01-10T00:00:00.000Z",
    "description": "Supermercado",
    "category": {
      "id": "uuid-cat-2",
      "name": "Alimentación",
      "type": "EXPENSE"
    }
  }
]
```

---

### 🔍 Filtrar transacciones por mes y año
```bash
# Transacciones de enero 2026
GET http://localhost:3000/transactions?month=1&year=2026
Authorization: Bearer {tu-jwt-token}

# Transacciones de todo 2026
GET http://localhost:3000/transactions?year=2026
Authorization: Bearer {tu-jwt-token}
```

**Nota:** Si proporcionas un mes, el año es obligatorio.

---

### 📊 Obtener estadísticas
```bash
# Estadísticas generales
GET http://localhost:3000/transactions/stats
Authorization: Bearer {tu-jwt-token}

# Estadísticas de enero 2026
GET http://localhost:3000/transactions/stats?month=1&year=2026
Authorization: Bearer {tu-jwt-token}
```

**Respuesta exitosa (200):**
```json
{
  "totalIncome": 3500,
  "totalExpense": 1280,
  "balance": 2220,
  "transactionCount": 7
}
```

---

### 🔎 Obtener una transacción específica
```bash
GET http://localhost:3000/transactions/{id}
Authorization: Bearer {tu-jwt-token}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid-de-transaccion",
  "amount": 150.50,
  "date": "2026-01-28T12:00:00.000Z",
  "description": "Compra de supermercado",
  "category": {
    "id": "uuid-categoria",
    "name": "Alimentación",
    "type": "EXPENSE"
  }
}
```

---

### ✏️ Actualizar transacción
```bash
PATCH http://localhost:3000/transactions/{id}
Authorization: Bearer {tu-jwt-token}
Content-Type: application/json

{
  "amount": 200,
  "description": "Actualizado - Supermercado grande"
}
```

**Nota:** Todos los campos son opcionales. Solo envía los que quieras actualizar.

**Respuesta exitosa (200):**
```json
{
  "id": "uuid-de-transaccion",
  "amount": 200,
  "date": "2026-01-28T12:00:00.000Z",
  "description": "Actualizado - Supermercado grande",
  "category": {
    "id": "uuid-categoria",
    "name": "Alimentación",
    "type": "EXPENSE"
  }
}
```

---

### 🗑️ Eliminar transacción
```bash
DELETE http://localhost:3000/transactions/{id}
Authorization: Bearer {tu-jwt-token}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Transacción eliminada exitosamente"
}
```

---

## Errores comunes

### 401 Unauthorized
No has incluido el token JWT o es inválido.
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
Intentas acceder a una transacción que no te pertenece.
```json
{
  "statusCode": 403,
  "message": "No tienes permiso para acceder a esta transacción"
}
```

### 404 Not Found
La transacción o categoría no existe.
```json
{
  "statusCode": 404,
  "message": "Transacción no encontrada"
}
```

### 400 Bad Request
Datos de entrada inválidos.
```json
{
  "statusCode": 400,
  "message": [
    "El monto debe ser mayor a 0",
    "La fecha debe ser una fecha válida"
  ],
  "error": "Bad Request"
}
```

---

## Ejemplos con cURL

### Crear transacción
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer tu-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "date": "2026-01-28T12:00:00Z",
    "description": "Compra de supermercado",
    "categoryId": "uuid-de-categoria"
  }'
```

### Obtener transacciones filtradas
```bash
curl -X GET "http://localhost:3000/transactions?month=1&year=2026" \
  -H "Authorization: Bearer tu-jwt-token"
```

### Actualizar transacción
```bash
curl -X PATCH http://localhost:3000/transactions/uuid-transaccion \
  -H "Authorization: Bearer tu-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200
  }'
```

### Eliminar transacción
```bash
curl -X DELETE http://localhost:3000/transactions/uuid-transaccion \
  -H "Authorization: Bearer tu-jwt-token"
```

---

## Testing con Postman

1. Importa esta colección en Postman
2. Configura la variable `{{baseUrl}}` = `http://localhost:3000`
3. Configura la variable `{{token}}` con tu JWT token
4. Prueba cada endpoint

### Variables de entorno Postman
```
baseUrl: http://localhost:3000
token: tu-jwt-token-aqui
```

---

## Próximos pasos

Para probar la API completamente necesitas:

1. **Implementar el módulo de Auth** para obtener tokens JWT
2. **Crear categorías** antes de poder crear transacciones
3. **Registrar un usuario** o usar el usuario de seed:
   - Email: `test@example.com`
   - Password: `password123`

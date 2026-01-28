# 🧪 Guía Completa de Prueba de la API

Esta guía te permite probar todo el sistema de principio a fin.

---

## 🚀 1. Preparación

### Iniciar el servidor
```bash
cd gastos-backend
npm run start:dev
```

El servidor estará en `http://localhost:3000`

---

## 👤 2. Registrar un Usuario

### Request
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Usuario Test"
  }'
```

### Response esperado
```json
{
  "user": {
    "id": "uuid-generado",
    "email": "test@example.com",
    "name": "Usuario Test"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Resultado:** 
- Usuario creado
- 12 categorías predefinidas creadas automáticamente
- Access token (válido 1 hora)
- Refresh token (válido 7 días)

**💾 Guarda los tokens para los siguientes pasos**

---

## 🔐 3. Login (Opcional)

Si ya tienes cuenta, puedes hacer login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 👥 4. Ver Perfil

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

**Reemplaza `TU_ACCESS_TOKEN`** con el token recibido en el registro.

### Response esperado
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "name": "Usuario Test",
  "income": 0,
  "createdAt": "2026-01-28T12:00:00.000Z"
}
```

---

## 📊 5. Listar Categorías (usando Prisma Studio)

Por ahora no hay endpoint de categorías, pero puedes verlas con:

```bash
npx prisma studio
```

Deberías ver 12 categorías para tu usuario:
- 4 de INCOME
- 8 de EXPENSE

**💡 Copia el ID de una categoría para crear transacciones**

---

## 💰 6. Crear una Transacción de Ingreso

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3000,
    "date": "2026-01-28T00:00:00Z",
    "description": "Salario de enero",
    "categoryId": "ID_DE_CATEGORIA_SALARIO"
  }'
```

**Reemplaza `ID_DE_CATEGORIA_SALARIO`** con el UUID de la categoría "Salario".

### Response esperado
```json
{
  "id": "uuid-transaccion",
  "amount": 3000,
  "date": "2026-01-28T00:00:00.000Z",
  "description": "Salario de enero",
  "userId": "uuid-usuario",
  "categoryId": "uuid-categoria",
  "category": {
    "id": "uuid-categoria",
    "name": "Salario",
    "type": "INCOME"
  }
}
```

---

## 💸 7. Crear una Transacción de Gasto

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "date": "2026-01-28T12:00:00Z",
    "description": "Compra en supermercado",
    "categoryId": "ID_DE_CATEGORIA_ALIMENTACION"
  }'
```

---

## 📋 8. Listar Todas las Transacciones

```bash
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Response esperado
```json
[
  {
    "id": "uuid-1",
    "amount": 3000,
    "date": "2026-01-28T00:00:00.000Z",
    "description": "Salario de enero",
    "category": {
      "id": "uuid-cat",
      "name": "Salario",
      "type": "INCOME"
    }
  },
  {
    "id": "uuid-2",
    "amount": 150.50,
    "date": "2026-01-28T12:00:00.000Z",
    "description": "Compra en supermercado",
    "category": {
      "id": "uuid-cat-2",
      "name": "Alimentación",
      "type": "EXPENSE"
    }
  }
]
```

---

## 🔍 9. Filtrar Transacciones por Mes

```bash
# Transacciones de enero 2026
curl -X GET "http://localhost:3000/transactions?month=1&year=2026" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 📊 10. Ver Estadísticas

```bash
curl -X GET http://localhost:3000/transactions/stats \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Response esperado
```json
{
  "totalIncome": 3000,
  "totalExpense": 150.50,
  "balance": 2849.50,
  "transactionCount": 2
}
```

---

## ✏️ 11. Actualizar una Transacción

```bash
curl -X PATCH http://localhost:3000/transactions/ID_TRANSACCION \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200,
    "description": "Compra grande en supermercado"
  }'
```

**Reemplaza `ID_TRANSACCION`** con el UUID de una transacción.

---

## 🗑️ 12. Eliminar una Transacción

```bash
curl -X DELETE http://localhost:3000/transactions/ID_TRANSACCION \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Response esperado
```json
{
  "message": "Transacción eliminada exitosamente"
}
```

---

## 🔄 13. Refrescar el Access Token

Cuando tu access token expire (después de 1 hora):

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_EXPIRADO" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN"
  }'
```

### Response esperado
```json
{
  "accessToken": "nuevo_access_token",
  "refreshToken": "nuevo_refresh_token"
}
```

**💡 Guarda los nuevos tokens y úsalos en lugar de los anteriores.**

---

## 🚪 14. Cerrar Sesión

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Response esperado
```json
{
  "message": "Logout exitoso"
}
```

**✅ El refresh token se elimina de la base de datos.**

---

## 🧪 Flujo Completo de Prueba

```bash
# 1. Registrarse
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba@test.com","password":"pass123","name":"Test"}' \
  | jq -r '.accessToken')

# 2. Ver perfil
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear transacción (necesitas el categoryId de Prisma Studio)
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "date": "2026-01-28T00:00:00Z",
    "description": "Test",
    "categoryId": "REEMPLAZAR_CON_ID_REAL"
  }'

# 4. Listar transacciones
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer $TOKEN"

# 5. Ver estadísticas
curl -X GET http://localhost:3000/transactions/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Colección Postman

### Variables de entorno
```
baseUrl: http://localhost:3000
accessToken: (se actualiza después de login/register)
refreshToken: (se actualiza después de login/register)
```

### Colección
1. **Auth**
   - Register
   - Login
   - Profile
   - Refresh
   - Logout

2. **Transactions**
   - Create Transaction
   - List Transactions
   - List Transactions (Filtered)
   - Get Stats
   - Get Transaction
   - Update Transaction
   - Delete Transaction

---

## ⚠️ Solución de Problemas

### Error 401 - Unauthorized
- Verifica que el token no haya expirado
- Asegúrate de incluir "Bearer " antes del token
- Usa refresh para obtener un nuevo token

### Error 404 - Category not found
- Necesitas obtener los IDs de categorías reales
- Usa `npx prisma studio` para ver las categorías
- O espera a que se implemente el endpoint GET /categories

### Error 409 - Email ya registrado
- El email ya existe en la base de datos
- Usa otro email o haz login con el existente

---

## ✅ Checklist de Prueba

- [ ] Registrar usuario
- [ ] Ver perfil
- [ ] Crear transacción de ingreso
- [ ] Crear transacción de gasto
- [ ] Listar todas las transacciones
- [ ] Filtrar por mes y año
- [ ] Ver estadísticas
- [ ] Actualizar transacción
- [ ] Eliminar transacción
- [ ] Refrescar token
- [ ] Logout

---

## 🎉 ¡Todo Funcional!

Si completaste todos los pasos, has probado exitosamente:

✅ Sistema de autenticación completo
✅ Registro con categorías automáticas
✅ JWT con access y refresh tokens
✅ CRUD completo de transacciones
✅ Filtros y estadísticas
✅ Seguridad con guards JWT

**Próximo paso:** Implementar módulo de Categories para facilitar la gestión.

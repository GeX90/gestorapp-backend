# Módulo de Transacciones

## Descripción
Módulo completo para gestionar transacciones (ingresos y gastos) de usuarios autenticados.

## Características implementadas

✅ CRUD completo de transacciones
✅ Validación de datos con class-validator
✅ Filtros por mes y año
✅ Solo acceso a datos del usuario autenticado
✅ Validación de amount > 0
✅ Estadísticas de transacciones
✅ Relación con categorías y usuarios
✅ Manejo de errores con excepciones HTTP

## Estructura de archivos

```
src/
├── transactions/
│   ├── dto/
│   │   ├── create-transaction.dto.ts
│   │   ├── update-transaction.dto.ts
│   │   └── filter-transaction.dto.ts
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   └── transactions.module.ts
├── auth/
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── app.module.ts

prisma/
└── schema.prisma
```

## Endpoints disponibles

### POST /transactions
Crear una nueva transacción
```json
{
  "amount": 150.50,
  "date": "2026-01-28T12:00:00Z",
  "description": "Compra de supermercado",
  "categoryId": "uuid-de-categoria"
}
```

### GET /transactions
Obtener todas las transacciones del usuario (con filtros opcionales)
```
Query params:
- month: 1-12 (opcional)
- year: 2000-2100 (opcional)

Ejemplos:
GET /transactions
GET /transactions?month=1&year=2026
GET /transactions?year=2026
```

### GET /transactions/stats
Obtener estadísticas de transacciones
```
Query params:
- month: número (opcional)
- year: número (opcional)

Respuesta:
{
  "totalIncome": 5000,
  "totalExpense": 3200,
  "balance": 1800,
  "transactionCount": 45
}
```

### GET /transactions/:id
Obtener una transacción específica

### PATCH /transactions/:id
Actualizar una transacción (campos opcionales)
```json
{
  "amount": 200,
  "description": "Actualizado"
}
```

### DELETE /transactions/:id
Eliminar una transacción

## Validaciones implementadas

### CreateTransactionDto
- `amount`: requerido, debe ser número positivo > 0
- `date`: requerido, formato ISO 8601
- `description`: opcional, máximo 500 caracteres
- `categoryId`: requerido, string UUID

### FilterTransactionDto
- `month`: opcional, entero entre 1-12
- `year`: opcional, entero entre 2000-2100
- Si se proporciona mes, el año es obligatorio

## Seguridad

- Todos los endpoints protegidos con `JwtAuthGuard`
- Validación de propiedad: usuarios solo acceden a sus propios datos
- Validación de categorías: solo se pueden usar categorías del usuario
- Excepciones HTTP claras: `NotFoundException`, `ForbiddenException`, `BadRequestException`

## Próximos pasos

Para completar el sistema, necesitarás implementar:

1. **Módulo de autenticación completo**
   - Registro de usuarios
   - Login con JWT
   - Refresh tokens
   - Hash de contraseñas con bcrypt

2. **Módulo de categorías**
   - CRUD de categorías por usuario
   - Categorías predefinidas
   - Tipos: INCOME / EXPENSE

3. **Módulo de presupuestos**
   - Presupuestos mensuales
   - Sistema de alertas
   - Comparación con gastos reales

4. **Módulo de exportación**
   - Exportar transacciones a CSV
   - Filtros por rango de fechas

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name init

# Iniciar en desarrollo
npm run start:dev

# Build para producción
npm run build

# Iniciar en producción
npm run start:prod
```

## Variables de entorno

Configura estas variables en `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/gestorapp?schema=public"
JWT_SECRET="tu-secreto-jwt-seguro"
JWT_REFRESH_SECRET="tu-secreto-refresh-seguro"
PORT=3000
```

## Modelo de datos (Prisma)

```prisma
model Transaction {
  id          String   @id @default(uuid())
  amount      Float
  date        DateTime
  description String?
  userId      String
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(...)
  category    Category @relation(...)
}
```

# Módulo de Presupuestos (Budgets)

## Descripción

Módulo para gestionar presupuestos mensuales de gastos con alertas automáticas cuando se alcanza un porcentaje definido del presupuesto.

## Características

✅ **Presupuesto único por mes/año**: Un usuario solo puede tener un presupuesto por período mensual
✅ **Cálculo automático de gastos**: Calcula el total gastado en el mes basándose en las transacciones
✅ **Alertas configurables**: Alerta automática cuando se supera el porcentaje definido (por defecto 80%)
✅ **Estado del presupuesto**: Información en tiempo real sobre gastos, porcentaje usado y monto restante

## Endpoints

### 1. Crear Presupuesto
```http
POST /budgets
Authorization: Bearer {token}
Content-Type: application/json

{
  "month": 1,
  "year": 2025,
  "amount": 3000,
  "alertAt": 80  // Opcional, por defecto 80%
}
```

**Respuesta:**
```json
{
  "id": "uuid",
  "month": 1,
  "year": 2025,
  "amount": 3000,
  "alertAt": 80,
  "userId": "uuid",
  "createdAt": "2025-01-28T...",
  "updatedAt": "2025-01-28T...",
  "spent": 1500,
  "remaining": 1500,
  "percentage": 50,
  "isOverBudget": false,
  "shouldAlert": false,
  "alertMessage": null
}
```

### 2. Listar Todos los Presupuestos
```http
GET /budgets
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "month": 1,
    "year": 2025,
    "amount": 3000,
    "spent": 2500,
    "remaining": 500,
    "percentage": 83.33,
    "isOverBudget": false,
    "shouldAlert": true,
    "alertMessage": "Has alcanzado el 83% de tu presupuesto"
  }
]
```

### 3. Obtener Presupuesto del Mes Actual
```http
GET /budgets/current
Authorization: Bearer {token}
```

**Respuesta:** Igual que el endpoint de creación

### 4. Obtener Presupuesto Específico
```http
GET /budgets/:year/:month
Authorization: Bearer {token}

Ejemplo: GET /budgets/2025/1
```

### 5. Actualizar Presupuesto
```http
PATCH /budgets/:year/:month
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 3500,
  "alertAt": 85
}
```

### 6. Eliminar Presupuesto
```http
DELETE /budgets/:year/:month
Authorization: Bearer {token}
```

## Validaciones

### CreateBudgetDto
- `month`: Requerido, número entre 1 y 12
- `year`: Requerido, número mínimo 2000
- `amount`: Requerido, número positivo
- `alertAt`: Opcional, número entre 0 y 100 (por defecto 80)

### UpdateBudgetDto
- `amount`: Opcional, número positivo
- `alertAt`: Opcional, número entre 0 y 100

## Reglas de Negocio

1. **Unicidad**: Solo puede existir un presupuesto por usuario/mes/año
2. **Cálculo de gastos**: Se calculan automáticamente sumando todas las transacciones de tipo EXPENSE del mes
3. **Alerta automática**: Se activa cuando `(spent / amount) * 100 >= alertAt`
4. **Sobrepasar presupuesto**: Se permite, pero se marca con `isOverBudget: true`

## Campos Calculados

Cada presupuesto incluye información adicional calculada en tiempo real:

- **spent**: Total gastado en el mes (solo transacciones EXPENSE)
- **remaining**: Monto restante (`amount - spent`)
- **percentage**: Porcentaje gastado con 2 decimales
- **isOverBudget**: `true` si spent > amount
- **shouldAlert**: `true` si percentage >= alertAt
- **alertMessage**: Mensaje de alerta si shouldAlert es true

## Ejemplos de Uso

### Crear presupuesto para enero 2025
```bash
curl -X POST http://localhost:3000/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2025,
    "amount": 3000,
    "alertAt": 80
  }'
```

### Ver presupuesto del mes actual
```bash
curl http://localhost:3000/budgets/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Actualizar límite de alerta a 90%
```bash
curl -X PATCH http://localhost:3000/budgets/2025/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alertAt": 90}'
```

## Integración con Transacciones

El módulo de presupuestos se integra automáticamente con el módulo de transacciones:
- Cada vez que se consulta un presupuesto, se calculan los gastos del mes
- Solo se cuentan transacciones de tipo EXPENSE
- Se filtran por fecha dentro del mes/año del presupuesto

## Errores Comunes

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Ya existe un presupuesto para 1/2025"
}
```
**Solución**: Usa PATCH para actualizar el presupuesto existente

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "No hay presupuesto configurado para 1/2025"
}
```
**Solución**: Crea un presupuesto con POST /budgets

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["month must be between 1 and 12"]
}
```
**Solución**: Verifica que los datos enviados cumplan las validaciones

## Próximas Mejoras

- [ ] Notificaciones por email cuando se activa una alerta
- [ ] Historial de alertas disparadas
- [ ] Presupuestos por categoría
- [ ] Sugerencias automáticas basadas en gastos históricos
- [ ] Exportar reportes de presupuestos

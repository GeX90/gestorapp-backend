# Ejemplos de API - Módulo Presupuestos

## Variables
```bash
export TOKEN="your_jwt_token_here"
export BASE_URL="http://localhost:3000"
```

## 1. Crear Presupuesto para Enero 2026
```bash
curl -X POST $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2026,
    "amount": 3000,
    "alertAt": 80
  }'
```

**Respuesta esperada:**
```json
{
  "id": "abc-123",
  "month": 1,
  "year": 2026,
  "amount": 3000,
  "alertAt": 80,
  "userId": "user-id",
  "createdAt": "2026-01-28T...",
  "updatedAt": "2026-01-28T...",
  "spent": 0,
  "remaining": 3000,
  "percentage": 0,
  "isOverBudget": false,
  "shouldAlert": false,
  "alertMessage": null
}
```

## 2. Crear Presupuesto para Febrero 2026
```bash
curl -X POST $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 2,
    "year": 2026,
    "amount": 2500
  }'
```

## 3. Ver Presupuesto del Mes Actual
```bash
curl $BASE_URL/budgets/current \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Ver Todos los Presupuestos
```bash
curl $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Ver Presupuesto Específico (Enero 2026)
```bash
curl $BASE_URL/budgets/2026/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Actualizar Presupuesto
```bash
# Cambiar monto a 3500
curl -X PATCH $BASE_URL/budgets/2026/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3500
  }'
```

```bash
# Cambiar nivel de alerta a 85%
curl -X PATCH $BASE_URL/budgets/2026/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alertAt": 85
  }'
```

```bash
# Cambiar ambos valores
curl -X PATCH $BASE_URL/budgets/2026/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4000,
    "alertAt": 90
  }'
```

## 7. Eliminar Presupuesto
```bash
curl -X DELETE $BASE_URL/budgets/2026/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Escenario Completo: Probar Alertas

### Paso 1: Registrar usuario
```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budget.test@example.com",
    "password": "Password123!",
    "name": "Budget Tester",
    "income": 5000
  }'
```

### Paso 2: Login
```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budget.test@example.com",
    "password": "Password123!"
  }'
```

Guarda el `access_token` en la variable TOKEN:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Paso 3: Crear presupuesto de 1000 con alerta al 80%
```bash
curl -X POST $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2026,
    "amount": 1000,
    "alertAt": 80
  }'
```

### Paso 4: Crear transacción de 500 (50% del presupuesto)
```bash
# Primero obtén el ID de una categoría de gastos
curl $BASE_URL/categories \
  -H "Authorization: Bearer $TOKEN"

# Usar el ID de una categoría EXPENSE
curl -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "categoryId": "CATEGORY_ID_HERE",
    "date": "2026-01-15T10:00:00Z",
    "description": "Gasto de prueba 1"
  }'
```

### Paso 5: Ver presupuesto (debe mostrar 50% gastado, sin alerta)
```bash
curl $BASE_URL/budgets/current \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "spent": 500,
  "remaining": 500,
  "percentage": 50,
  "shouldAlert": false,
  "alertMessage": null
}
```

### Paso 6: Crear otra transacción de 400 (total 90%)
```bash
curl -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 400,
    "categoryId": "CATEGORY_ID_HERE",
    "date": "2026-01-20T10:00:00Z",
    "description": "Gasto de prueba 2"
  }'
```

### Paso 7: Ver presupuesto (debe activar alerta)
```bash
curl $BASE_URL/budgets/current \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "spent": 900,
  "remaining": 100,
  "percentage": 90,
  "shouldAlert": true,
  "alertMessage": "Has alcanzado el 90% de tu presupuesto",
  "isOverBudget": false
}
```

### Paso 8: Crear transacción que supere el presupuesto
```bash
curl -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300,
    "categoryId": "CATEGORY_ID_HERE",
    "date": "2026-01-25T10:00:00Z",
    "description": "Gasto que supera presupuesto"
  }'
```

### Paso 9: Ver presupuesto (debe marcar como excedido)
```bash
curl $BASE_URL/budgets/current \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "spent": 1200,
  "remaining": -200,
  "percentage": 120,
  "shouldAlert": true,
  "alertMessage": "Has alcanzado el 120% de tu presupuesto",
  "isOverBudget": true
}
```

## Casos de Error

### Intentar crear presupuesto duplicado
```bash
curl -X POST $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2026,
    "amount": 2000
  }'
```

**Error 409:**
```json
{
  "statusCode": 409,
  "message": "Ya existe un presupuesto para 1/2026"
}
```

### Mes inválido
```bash
curl -X POST $BASE_URL/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 13,
    "year": 2026,
    "amount": 1000
  }'
```

**Error 400:**
```json
{
  "statusCode": 400,
  "message": ["month must not be greater than 12"]
}
```

### Presupuesto no encontrado
```bash
curl $BASE_URL/budgets/2025/12 \
  -H "Authorization: Bearer $TOKEN"
```

**Error 404:**
```json
{
  "statusCode": 404,
  "message": "No hay presupuesto para 12/2025"
}
```

## Integración con Frontend

### React/Vue/Angular - Ejemplo de Service
```typescript
class BudgetService {
  async createBudget(data: CreateBudgetDto) {
    const response = await fetch('/budgets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getCurrentBudget() {
    const response = await fetch('/budgets/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  // Mostrar alerta en UI
  showBudgetAlert(budget: Budget) {
    if (budget.shouldAlert) {
      alert(budget.alertMessage);
    }
  }
}
```

## Testing con Jest/Supertest

Ver archivo `budgets.e2e-spec.ts` para tests de integración completos.

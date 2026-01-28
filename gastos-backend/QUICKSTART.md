# 🚀 Guía de Inicio Rápido

## ⚡ Puesta en Marcha (5 minutos)

### 1. Instalar dependencias (si no lo has hecho)
```bash
npm install
```

### 2. Configurar base de datos
Edita el archivo `.env` con tu conexión a PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/gestorapp?schema=public"
JWT_SECRET="tu-secreto-jwt-muy-seguro"
PORT=3000
```

### 3. Preparar Prisma
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:migrate

# Poblar con datos de prueba
npm run prisma:seed
```

### 4. Iniciar servidor
```bash
npm run start:dev
```

✅ El servidor estará corriendo en `http://localhost:3000`

---

## 🧪 Probar la API

### Registro rápido
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Usuario Test"
  }'
```

Guarda el `accessToken` de la respuesta.

### Crear una transacción
Primero necesitas el ID de una categoría. Abre Prisma Studio:
```bash
npx prisma studio
```

Luego crea una transacción:
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "date": "2026-01-28T12:00:00Z",
    "description": "Compra de supermercado",
    "categoryId": "ID_DE_TU_CATEGORIA"
  }'
```

### Ver todas las transacciones
```bash
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

**📚 Guía completa:** Ver [TESTING_GUIDE.md](TESTING_GUIDE.md) para todos los ejemplos.

---

## 📚 Documentación Completa

- **[AUTH_MODULE.md](AUTH_MODULE.md)** - Documentación de autenticación
- **[TRANSACTIONS_MODULE.md](TRANSACTIONS_MODULE.md)** - Documentación de transacciones
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guía completa de pruebas
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Más ejemplos de uso

---

## 🔄 Comandos Útiles

### Desarrollo
```bash
npm run start:dev          # Modo desarrollo con hot-reload
npm run build              # Compilar proyecto
npm run start:prod         # Ejecutar en producción
```

### Prisma
```bash
npm run prisma:generate    # Generar cliente de Prisma
npm run prisma:migrate     # Crear/ejecutar migraciones
npm run prisma:seed        # Poblar base de datos
npx prisma studio          # Explorador visual de DB
```

### Testing
```bash
npm test                   # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Coverage
```

---

## ⚠️ Errores de TypeScript en VSCode

Si ves errores como "Property 'transaction' does not exist on type 'PrismaService'":

1. El código compila correctamente (npm run build funciona)
2. Es un problema de intellisense de VSCode
3. **Solución:** Recargar ventana de VSCode
   - Presiona `Ctrl+Shift+P`
   - Escribe "Reload Window"
   - Presiona Enter

---

## 📝 Siguiente Paso

**Implementar el módulo de Auth completo** para poder:
- Registrar usuarios
- Hacer login y obtener JWT tokens
- Probar todos los endpoints de transacciones

El módulo de transacciones está **100% listo**, solo necesitas autenticación para usarlo.

---

## 🆘 Troubleshooting

### Error: Cannot connect to database
- Verifica que PostgreSQL esté corriendo
- Confirma que DATABASE_URL en .env sea correcto
- Verifica usuario y contraseña

### Error: Prisma Client not generated
```bash
npm run prisma:generate
```

### Error: Table does not exist
```bash
npm run prisma:migrate
```

### Puerto 3000 en uso
Cambia el puerto en `.env`:
```env
PORT=4000
```

---

## ✨ Características Implementadas

✅ CRUD completo de transacciones
✅ Validación robusta con class-validator
✅ Filtros por mes y año
✅ Estadísticas (ingresos, gastos, balance)
✅ Seguridad con JWT Guards
✅ Solo acceso a datos propios del usuario
✅ Manejo de errores profesional
✅ Documentación completa

---

## 📞 Ayuda Adicional

Si tienes dudas:
1. Lee [TRANSACTIONS_MODULE.md](TRANSACTIONS_MODULE.md) para detalles técnicos
2. Consulta [API_EXAMPLES.md](API_EXAMPLES.md) para ejemplos prácticos
3. Revisa el código - está bien comentado
4. Examina [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) para el estado completo

¡Feliz desarrollo! 🚀

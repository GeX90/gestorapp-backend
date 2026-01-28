# 💰 GestorApp Backend

Backend de una aplicación de gestión de gastos personales construido con NestJS, Prisma y PostgreSQL.

## 📋 Descripción

API REST para gestionar finanzas personales con las siguientes características:

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Gestión de transacciones** (ingresos y gastos)
- ✅ **Categorías personalizadas** por usuario
- ✅ **Presupuestos mensuales** con sistema de alertas
- ✅ **Filtros y estadísticas** de transacciones
- ✅ **Exportación a CSV** (próximamente)

## 🛠️ Stack Tecnológico

- **Framework:** NestJS 11
- **ORM:** Prisma 7
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT + Passport
- **Validación:** class-validator
- **Testing:** Jest

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Edita el archivo .env con tu conexión de PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/gestorapp?schema=public"
JWT_SECRET="tu-secreto-jwt-seguro"

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos de prueba
npm run prisma:seed
```

## 🚀 Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación ✅
│   ├── dto/               
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── refresh-token.dto.ts
│   ├── guards/             # Guards JWT
│   ├── strategies/         # Estrategias Passport
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── transactions/           # Módulo de transacciones ✅
│   ├── dto/               
│   │   ├── create-transaction.dto.ts
│   │   ├── update-transaction.dto.ts
│   │   └── filter-transaction.dto.ts
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   └── transactions.module.ts
├── prisma/                # Módulo de Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── app.module.ts

prisma/
├── schema.prisma          # Esquema de base de datos
└── seed.ts               # Datos de prueba
```

## 📚 Módulos Implementados

### ✅ Autenticación
Sistema completo de autenticación con JWT, refresh tokens y registro de usuarios.

Ver documentación detallada: [AUTH_MODULE.md](AUTH_MODULE.md)

**Endpoints:**
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Ver perfil

### ✅ Transacciones
CRUD completo de transacciones con filtros, validaciones y estadísticas.

Ver documentación detallada: [TRANSACTIONS_MODULE.md](TRANSACTIONS_MODULE.md)

**Endpoints:**
- `POST /transactions` - Crear transacción
- `GET /transactions` - Listar transacciones (con filtros)
- `GET /transactions/stats` - Obtener estadísticas
- `GET /transactions/:id` - Obtener una transacción
- `PATCH /transactions/:id` - Actualizar transacción
- `DELETE /transactions/:id` - Eliminar transacción

Ver ejemplos de uso: [API_EXAMPLES.md](API_EXAMPLES.md)

## 🗄️ Base de Datos

### Modelos principales

- **User** - Usuarios del sistema
- **Category** - Categorías de ingresos/gastos
- **Transaction** - Transacciones (ingresos/gastos)
- **Budget** - Presupuestos mensuales

### Comandos Prisma útiles

```bash
# Generar cliente
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Ver base de datos
npx prisma studio

# Seed
npm run prisma:seed
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

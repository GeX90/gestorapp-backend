# Exportación de Transacciones a CSV

## Descripción

Endpoint para exportar todas las transacciones de un mes específico a formato CSV, listo para abrir en Excel u otras herramientas de hojas de cálculo.

## Endpoint

```http
GET /transactions/export/:year/:month
Authorization: Bearer {token}
```

### Parámetros de Ruta

- **year** (number): Año de las transacciones (ej: 2026)
- **month** (number): Mes de las transacciones (1-12)

### Ejemplo de Uso

```bash
# Exportar transacciones de enero 2026
curl http://localhost:3000/transactions/export/2026/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output transacciones_2026_01.csv
```

## Formato del CSV

### Columnas

1. **Fecha**: Fecha y hora de la transacción (YYYY-MM-DD HH:MM)
2. **Categoría**: Nombre de la categoría
3. **Tipo**: INCOME o EXPENSE
4. **Monto**: Cantidad con 2 decimales
5. **Descripción**: Descripción de la transacción

### Resumen al Final

El archivo incluye un resumen con:
- Total de ingresos
- Total de gastos
- Balance (ingresos - gastos)

### Ejemplo de Contenido

```csv
Fecha,Categoría,Tipo,Monto,Descripción
2026-01-05 10:30,Salario,INCOME,3000.00,Pago de enero
2026-01-08 14:15,Supermercado,EXPENSE,250.50,"Compra semanal, productos varios"
2026-01-10 09:00,Transporte,EXPENSE,50.00,Tarjeta de metro
2026-01-15 16:45,Restaurantes,EXPENSE,85.75,Almuerzo con clientes

RESUMEN
Total Ingresos,,INCOME,3000.00
Total Gastos,,EXPENSE,386.25
Balance,,,2613.75
```

## Características

### ✅ Manejo de Caracteres Especiales

El CSV maneja correctamente:
- **Comas en descripciones**: Se envuelven en comillas dobles
- **Comillas dobles**: Se duplican ("" en lugar de ")
- **Saltos de línea**: Se preservan dentro de comillas
- **Caracteres UTF-8**: Compatible con acentos y caracteres especiales

### ✅ Compatible con Excel

- Incluye **BOM (Byte Order Mark)** para que Excel detecte UTF-8
- Formato estándar RFC 4180
- Extensión `.csv` sugerida

### ✅ Ordenamiento

Las transacciones se exportan ordenadas por fecha ascendente (más antigua primero).

### ✅ Nombre del Archivo

El archivo descargado se nombra automáticamente:
```
transacciones_YYYY_MM.csv
```

Ejemplo: `transacciones_2026_01.csv`

## Respuestas

### ✅ Éxito (200 OK)

Descarga directa del archivo CSV con headers apropiados:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="transacciones_2026_01.csv"
```

### ❌ Error 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": "El mes debe estar entre 1 y 12"
}
```

**Causas:**
- Mes inválido (menor a 1 o mayor a 12)
- No se proporcionó mes o año

### ❌ Error 404 - Not Found

```json
{
  "statusCode": 404,
  "message": "No hay transacciones para 1/2026"
}
```

**Causa:** No existen transacciones en el mes/año especificado.

### ❌ Error 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** Token JWT inválido o no proporcionado.

## Ejemplos Prácticos

### Ejemplo 1: Descargar con curl

```bash
export TOKEN="your_jwt_token"

# Exportar enero 2026
curl -o enero_2026.csv \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/transactions/export/2026/1

# Exportar febrero 2026
curl -o febrero_2026.csv \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/transactions/export/2026/2
```

### Ejemplo 2: JavaScript/TypeScript (Fetch API)

```typescript
async function exportTransactions(year: number, month: number) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(
    `http://localhost:3000/transactions/export/${year}/${month}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al exportar transacciones');
  }

  // Obtener el blob del CSV
  const blob = await response.blob();
  
  // Crear enlace de descarga
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transacciones_${year}_${String(month).padStart(2, '0')}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Uso
exportTransactions(2026, 1);
```

### Ejemplo 3: React Component

```tsx
import React from 'react';
import axios from 'axios';

function ExportButton({ year, month }: { year: number; month: number }) {
  const handleExport = async () => {
    try {
      const response = await axios.get(
        `/transactions/export/${year}/${month}`,
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Crear descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transacciones_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('No se pudo exportar el archivo');
    }
  };

  return (
    <button onClick={handleExport}>
      Exportar Transacciones de {month}/{year}
    </button>
  );
}
```

### Ejemplo 4: Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private http: HttpClient) {}

  exportTransactions(year: number, month: number) {
    this.http.get(
      `/transactions/export/${year}/${month}`,
      { responseType: 'blob', observe: 'response' }
    ).subscribe(response => {
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `transacciones_${year}_${month}.csv`;

      // Descargar archivo
      const blob = new Blob([response.body!], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
```

## Casos de Uso

### 1. Contabilidad Personal
Exportar transacciones mensuales para análisis en Excel o Google Sheets.

### 2. Declaración de Impuestos
Generar reportes de ingresos y gastos para presentación fiscal.

### 3. Auditoría
Revisar historial de transacciones en formato estándar.

### 4. Análisis Avanzado
Importar datos a herramientas de BI o análisis de datos.

### 5. Backup
Mantener respaldo de transacciones en formato universal.

## Integración con Frontend

### Botón de Exportación

```tsx
// Botón simple
<button onClick={() => exportCSV(2026, 1)}>
  📥 Exportar CSV
</button>

// Con selector de mes
<select onChange={(e) => {
  const [year, month] = e.target.value.split('-');
  exportCSV(parseInt(year), parseInt(month));
}}>
  <option value="2026-1">Enero 2026</option>
  <option value="2026-2">Febrero 2026</option>
  {/* ... */}
</select>
```

### Indicador de Carga

```tsx
const [exporting, setExporting] = useState(false);

const handleExport = async () => {
  setExporting(true);
  try {
    await exportTransactions(year, month);
  } finally {
    setExporting(false);
  }
};

return (
  <button onClick={handleExport} disabled={exporting}>
    {exporting ? '⏳ Exportando...' : '📥 Exportar CSV'}
  </button>
);
```

## Limitaciones

- Solo exporta transacciones de un mes completo
- No permite filtrar por categoría específica
- Formato fijo de columnas

## Próximas Mejoras

- [ ] Exportar rango de fechas personalizado
- [ ] Filtrar por tipo (solo ingresos o solo gastos)
- [ ] Filtrar por categoría
- [ ] Exportar a otros formatos (Excel, PDF)
- [ ] Incluir gráficos en exportación
- [ ] Plantillas personalizables

## Notas Técnicas

### Implementación

- Sin dependencias externas (usa Node.js nativo)
- Manejo correcto de encoding UTF-8
- Cumple con RFC 4180 (estándar CSV)
- Streaming directo sin almacenamiento temporal

### Rendimiento

- Eficiente para miles de transacciones
- Sin límite de cantidad (depende de memoria disponible)
- Generación bajo demanda

### Seguridad

- Protegido con JWT
- Solo exporta transacciones del usuario autenticado
- No expone información sensible de otros usuarios

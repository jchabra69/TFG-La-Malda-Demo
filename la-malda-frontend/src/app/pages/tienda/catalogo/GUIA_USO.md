# Componente Catálogo - Guía de Uso

## Ubicación
`src/app/pages/tienda/catalogo/`

## Ruta
`/catalogo`

## Descripción
Componente que muestra todos los productos de la tienda con filtros de búsqueda y categorías.

## Características Principales

### 1. Barra de búsqueda superior
- Búsqueda en tiempo real por nombre y descripción del producto
- Se actualiza la URL automáticamente con el parámetro `busqueda`

### 2. Sidebar de filtros (Desktop)
- Muestra árbol de categorías principales y subcategorías
- Botón "Limpiar" para resetear todos los filtros
- Contador de productos encontrados

### 3. Menú móvil de filtros
- Botón flotante en la esquina inferior derecha
- Sidebar deslizable desde la derecha
- Mismas funcionalidades que el desktop

### 4. Ordenación de productos
- Más relevantes (destacados primero)
- Precio: Menor a Mayor
- Precio: Mayor a Menor
- Nombre: A-Z
- Nombre: Z-A

### 5. Grid de productos
- Usa el componente `TarjetaProductoComponent`
- Grid responsive (4 columnas en desktop, 2 en móvil)
- Estados de carga con skeleton screens
- Mensaje cuando no hay resultados

## Cómo enlazar al Catálogo desde otros componentes

### Opción 1: Enlace directo sin filtros
```html
<a routerLink="/catalogo">Ver catálogo completo</a>
```

### Opción 2: Enlace con filtro de categoría
```html
<!-- Usando ID de categoría -->
<a [routerLink]="['/catalogo']" [queryParams]="{ categoria: 1 }">
  Ver productos de Mujer
</a>

<!-- Desde TypeScript -->
<button (click)="irACatalogo(1)">Ver Mujer</button>

// En el componente:
irACatalogo(categoriaId: number) {
  this.router.navigate(['/catalogo'], {
    queryParams: { categoria: categoriaId }
  });
}
```

### Opción 3: Enlace con búsqueda predefinida
```html
<a [routerLink]="['/catalogo']" [queryParams]="{ busqueda: 'vestidos' }">
  Buscar vestidos
</a>
```

### Opción 4: Combinación de filtros
```html
<a [routerLink]="['/catalogo']" [queryParams]="{ categoria: 4, busqueda: 'verano' }">
  Ropa de mujer de verano
</a>
```

## Ejemplos prácticos de uso

### En el Home (componente de categorías)
```typescript
// home-component.ts
verCategoria(categoriaId: number) {
  this.router.navigate(['/catalogo'], {
    queryParams: { categoria: categoriaId }
  });
}
```

```html
<!-- home-component.html -->
<button 
  *ngFor="let cat of categorias"
  (click)="verCategoria(cat.id)"
  class="tarjeta-categoria"
>
  {{ cat.nombre }}
</button>
```

### En el Navbar
```html
<!-- navbar-component.html -->
<a [routerLink]="['/catalogo']" [queryParams]="{ categoria: 1 }">
  Ver todo Mujer
</a>
```

### Búsqueda desde el Navbar
Si tienes un input de búsqueda en el navbar:
```typescript
// navbar-component.ts
buscar() {
  if (this.terminoBusqueda.trim()) {
    this.router.navigate(['/catalogo'], {
      queryParams: { busqueda: this.terminoBusqueda }
    });
  }
}
```

## IDs de Categorías Principales (según la BD)

```javascript
// Categorías principales
1 - Mujer
2 - Hombre
3 - Niños

// Subcategorías de Mujer
4 - Ropa Mujer
5 - Accesorios Mujer
8 - Vestidos
9 - Camisetas Mujer
10 - Pantalones Mujer
11 - Chaquetas Mujer
12 - Bikinis
13 - Gorras Mujer
14 - Pañuelos Mujer

// Subcategorías de Hombre
6 - Ropa Hombre
7 - Accesorios Hombre
15 - Camisetas Hombre
16 - Pantalones Hombre
17 - Chaquetas Hombre
18 - Camisas
19 - Gorras Hombre

// Accesorios compartidos
20 - Collares
```

## Parámetros de URL soportados

- `categoria` (número): ID de la categoría a filtrar
- `busqueda` (string): Término de búsqueda

## Arquitectura del filtrado

El componente implementa un sistema de filtrado jerárquico:

1. **Filtro por búsqueda**: Busca en nombre y descripción
2. **Filtro por categoría**: 
   - Si seleccionas una categoría padre (ej: "Mujer"), muestra todos los productos de esa categoría Y sus subcategorías
   - Si seleccionas una subcategoría, solo muestra productos de esa subcategoría específica

## Variables CSS utilizadas

El componente usa las variables personalizadas de Tailwind definidas en `tailwind.config.js` y `styles.scss`:

- Colores: `var(--red)`, `var(--text-primary)`, etc.
- Espaciados: Variables de spacing de Tailwind
- Transiciones: Clases de transición de Tailwind

## Responsive

- **Desktop (1024px+)**: Sidebar fijo a la izquierda
- **Tablet/Mobile (< 1024px)**: Menú lateral deslizable con botón flotante

## Estado de carga

El componente muestra skeleton screens mientras carga los productos, mejorando la percepción de velocidad de carga.

## Integración con otros servicios

- `ProductosService`: Para obtener todos los productos
- `CategoriasService`: Para obtener el árbol de categorías
- `Router` y `ActivatedRoute`: Para manejar los query params

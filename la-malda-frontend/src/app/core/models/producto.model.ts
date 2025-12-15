export interface ProductoVariante {
  id?: number;
  talla: string;
  color: string;
  stock: number;
  colorCode?: string;
  estaActiva?: boolean;
  imagenUrl?: string;
}

export interface ProductoImagen {
  id?: number;
  url: string;
  esPrincipal: boolean;
  orden: number;
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  precio: number;
  destacado: boolean;
  imagenPrincipal?: string;
  categoriaId: number;
  variantes: ProductoVariante[];
  imagenes: ProductoImagen[];
  variants?: ProductoVariante[];
  images?: ProductoImagen[];
  categorias?: { id: number; nombre: string; slug: string }[];

  // Campos legados que siguen usándose en componentes antiguos
  precioBase?: number;
  precioOferta?: number;
  precioFinal?: number;
  porcentajeDescuento?: number;
  descripcionCorta?: string;
  sku?: string;
  marca?: string;
  genero?: string;
  temporada?: string;
  estaActivo?: boolean;
  esNuevo?: boolean;
  esDestacado?: boolean;
  pesoGramos?: number;
  unidadesVendidas?: number;
  numeroVisualizaciones?: number;
  totalStock?: number;
  valoracionMedia?: number;
  totalResenas?: number;
  tituloMeta?: string;
  descripcionMeta?: string;
  palabrasClaveMeta?: string;
  nombresCategorias?: string[];
  coloresDisponibles?: string[];
  tallasDisponibles?: string[];
  material?: string;
  cuidado?: string;
  fechaLanzamiento?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ProductoFormulario {
  nombre: string;
  slug: string;
  descripcion?: string;
  precio: number;
  categoriaId: number;
  destacado: boolean;
  imagenPrincipal?: string;
  variantes: ProductoVariante[];
  imagenes: ProductoImagen[];
}

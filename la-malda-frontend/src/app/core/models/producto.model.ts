export interface ProductoVariante {
  id?: number;
  talla: string;
  color: string;
  stock: number;
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

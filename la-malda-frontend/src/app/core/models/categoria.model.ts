export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  idCategoriaPadre?: number | null;
  nombreCategoriaPadre?: string | null;
  subcategorias?: Categoria[];
  genero?: string | null;
  orden?: number | null;
  totalProductos?: number;
  descripcion?: string | null;
  descripcionMeta?: string | null;
  urlFallback?: string | null;
  fallbackImagen?: string | null;
}

export interface CategoriaFormulario {
  nombre: string;
  slug: string;
  idCategoriaPadre?: number | null;
}

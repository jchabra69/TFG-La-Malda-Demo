// Respuesta paginada genérica que nos devuelve el backend.
// La usamos pa listas grandes de productos, pedidos, etc.
export interface PageResponse<T> {
  contenido: T[];
  totalElementos: number;
  totalPaginas: number;
  tamanio: number;
  number: number;
}

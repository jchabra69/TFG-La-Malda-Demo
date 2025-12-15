export interface CarritoProd {
  id: number;
  productoId: number;
  nombreProducto: string;
  imagenUrl?: string;
  color?: string;
  talla?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CarritoResponse {
  productos: CarritoProd[];
  totalProductos: number;
  subtotal: number;
  total?: number;
}

export interface CarritoProdRequest {
  productoId: number;
  cantidad: number;
  idSesion?: string;
}

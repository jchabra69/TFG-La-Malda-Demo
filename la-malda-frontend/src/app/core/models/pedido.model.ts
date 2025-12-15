export interface Pedido {
  id: number;
  usuarioId: number;
  usuarioNombre?: string;
  usuarioEmail?: string;
  direccionId: number;
  direccion?: PedidoDireccion | null;
  total: number;
  estado: string;
  fecha: string;
  lineas: LineaPedido[];
}

export interface LineaPedido {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoCreateRequest {
  direccionId: number;
}

export interface PedidoDireccion {
  id: number;
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

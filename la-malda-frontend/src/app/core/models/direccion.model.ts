export interface Direccion {
  id: number;
  usuarioId?: number;
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface DireccionPayload {
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

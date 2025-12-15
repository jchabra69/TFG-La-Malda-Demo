export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  rol: string;
  activo: boolean;
  password?: string;
}

export interface UsuarioFormulario {
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  rol: string;
  password?: string;
  activo: boolean;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface RegistroUsuario {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  rol?: string;
  activo?: boolean;
}

export interface RespuestaAuth {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  rol: string;
  activo?: boolean;
  token: string;
  mensaje?: string;
}

export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  rol: string;
  activo?: boolean;
  token?: string;
}

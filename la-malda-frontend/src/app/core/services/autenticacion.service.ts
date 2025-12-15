import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CarritoService } from './carrito.service';
import {
  CredencialesLogin,
  RegistroUsuario,
  RespuestaAuth,
  UsuarioSesion,
  Usuario
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private carritoService = inject(CarritoService);

  private apiUrl = `${environment.apiUrl}/auth`;
  private usuariosUrl = `${environment.apiUrl}/users`;

  private usuarioActualSignal = signal<UsuarioSesion | null>(null);
  private estaAutenticadoSignal = signal<boolean>(false);

  usuarioActual = this.usuarioActualSignal.asReadonly();
  estaAutenticado = this.estaAutenticadoSignal.asReadonly();
  esAdmin = computed(() => this.rolEs('ADMIN', this.usuarioActualSignal()?.rol));
  esCliente = computed(() => this.rolEs('CLIENTE', this.usuarioActualSignal()?.rol));
  inicialesUsuario = computed(() => {
    const user = this.usuarioActualSignal();
    if (!user?.nombre) {
      return '';
    }
    const partes = user.nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) {
      return '';
    }
    const letras = partes.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '');
    return letras.join('');
  });

  constructor() {
    this.cargarUsuarioStorage();
  }

  login(credentials: CredencialesLogin): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.manejarSesion(response)),
      catchError(error => throwError(() => error))
    );
  }

  registro(datos: RegistroUsuario): Observable<RespuestaAuth> {
    const payload: RegistroUsuario = {
      ...datos,
      rol: datos.rol ?? 'CLIENTE',
      activo: datos.activo ?? true
    };
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => this.manejarSesion(response)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }

  getPerfil(): Observable<Usuario> {
    const actual = this.usuarioActualSignal();
    if (!actual?.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    return this.http.get<Usuario>(`${this.usuariosUrl}/${actual.id}`).pipe(
      tap(usuario => this.actualizarSesionDesdePerfil(usuario)),
      catchError(error => throwError(() => error))
    );
  }

  actualizarPerfil(datos: { nombre: string; apellidos: string; telefono: string; email: string; rol: string; activo: boolean }): Observable<Usuario> {
    const actual = this.usuarioActualSignal();
    if (!actual?.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    return this.http.put<Usuario>(`${this.usuariosUrl}/${actual.id}`, datos).pipe(
      tap(usuario => this.actualizarSesionDesdePerfil(usuario)),
      catchError(error => throwError(() => error))
    );
  }

  comprobarCredenciales(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.limpiarSesion();
      return false;
    }
    if (this.estaElTokenExpirado(token)) {
      this.limpiarSesion();
      return false;
    }
    return this.estaAutenticadoSignal();
  }

  private manejarSesion(response: RespuestaAuth): void {
    const sesion: UsuarioSesion = {
      id: response.id,
      email: response.email,
      nombre: response.nombre,
      apellidos: response.apellidos,
      telefono: response.telefono,
      rol: response.rol,
      activo: response.activo
    };
    localStorage.setItem('usuarioActual', JSON.stringify(sesion));
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    this.usuarioActualSignal.set(sesion);
    this.estaAutenticadoSignal.set(true);

    if (this.rolEs('ADMIN', response.rol)) {
      this.router.navigate(['/admin']);
      return;
    }

    this.carritoService.transferirCarrito().subscribe({
      next: () => this.redirigirCliente(),
      error: () => this.redirigirCliente()
    });
  }

  private redirigirCliente(): void {
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigate([redirectUrl]);
    } else {
      this.router.navigate(['/']);
    }
  }

  private cargarUsuarioStorage(): void {
    const userJson = localStorage.getItem('usuarioActual');
    const token = localStorage.getItem('authToken');
    if (!userJson || !token) {
      this.limpiarSesion();
      return;
    }
    if (this.estaElTokenExpirado(token)) {
      this.limpiarSesion();
      return;
    }
    try {
      const raw = JSON.parse(userJson) as UsuarioSesion;
      this.usuarioActualSignal.set(raw);
      this.estaAutenticadoSignal.set(true);
    } catch {
      this.limpiarSesion();
    }
  }

  private actualizarSesionDesdePerfil(usuario: Usuario): void {
    const sesion: UsuarioSesion = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      rol: usuario.rol,
      activo: usuario.activo
    };
    this.usuarioActualSignal.set(sesion);
    this.estaAutenticadoSignal.set(true);
    localStorage.setItem('usuarioActual', JSON.stringify(sesion));
  }

  private limpiarSesion(): void {
    this.carritoService.resetLocal();
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('authToken');
    this.usuarioActualSignal.set(null);
    this.estaAutenticadoSignal.set(false);
  }

  private estaElTokenExpirado(token: string): boolean {
    const payload = this.leerTokenPayload(token);
    if (!payload?.exp) {
      return true;
    }
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  }

  private leerTokenPayload(token: string): any | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private rolEs(esperado: string, rol?: string | null): boolean {
    if (!rol) {
      return false;
    }
    const normalizado = rol.toUpperCase();
    const objetivo = esperado.toUpperCase();
    return normalizado === objetivo || normalizado === `ROLE_${objetivo}`;
  }
}

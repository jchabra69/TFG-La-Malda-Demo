import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Usuario } from '../models/usuario.model';

export interface AdminStats {
  totalUsuarios: number;
  usuariosActivos: number;
  totalProductos: number;
  totalCategorias: number;
  productosInactivos?: number;
  productosConBajoStock?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/users`);
  }

  crearUsuario(payload: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/users`, payload);
  }

  actualizarUsuario(id: number, payload: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/users/${id}`, payload);
  }

  alternarActivo(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/users/${id}`).pipe(
      switchMap(usuario => {
        const actualizado = { ...usuario, activo: !usuario.activo };
        return this.http.put<Usuario>(`${this.baseUrl}/users/${id}`, actualizado);
      })
    );
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }
}

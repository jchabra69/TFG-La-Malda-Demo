import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Direccion, DireccionPayload } from '../models/direccion.model';

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/addresses`;

  getDirecciones(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(this.apiUrl);
  }

  crearDireccion(payload: DireccionPayload): Observable<Direccion> {
    return this.http.post<Direccion>(this.apiUrl, payload);
  }

  actualizarDireccion(id: number, payload: DireccionPayload): Observable<Direccion> {
    return this.http.put<Direccion>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarDireccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

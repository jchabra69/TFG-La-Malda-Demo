import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Pedido, PedidoCreateRequest } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  crearPedido(request: PedidoCreateRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, request);
  }

  obtenerMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  obtenerPedidoPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  obtenerPedidosAdmin(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/admin`);
  }

  actualizarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/admin/${id}/estado`, { estado });
  }
}

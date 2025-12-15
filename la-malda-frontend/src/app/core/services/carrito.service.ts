import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CarritoResponse, CarritoProd, CarritoProdRequest } from '../models/carrito.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  private carritoState = signal<CarritoResponse | null>(null);
  public carrito = this.carritoState.asReadonly();

  private contadorProdsState = signal<number>(0);
  public contadorProd = this.contadorProdsState.asReadonly();

  constructor() {
    this.cargarDesdeStorage();
    this.cargarCarrito().subscribe();
  }

  private getIdSesion(): string {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = this.generarIdSesion();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }

  private generarIdSesion(): string {
    const numeroAleatorio = Math.floor(10000 + Math.random() * 90000);
    return `sesion_${numeroAleatorio}`;
  }

  private cargarDesdeStorage() {
    try {
      const snapshot = localStorage.getItem('cart_snapshot');
      if (snapshot) {
        const parsed: CarritoResponse = JSON.parse(snapshot);
        this.carritoState.set(parsed);
        this.contadorProdsState.set(parsed.totalProductos ?? 0);
      }
    } catch (e) {
      console.error('No se pudo restaurar carrito desde local storage', e);
    }
  }

  private guardarEnStorage(carrito: CarritoResponse) {
    try {
      localStorage.setItem('cart_snapshot', JSON.stringify(carrito));
    } catch (e) {
      console.error('No se pudo guardar carrito en el local storage', e);
    }
  }

  cargarCarrito(): Observable<CarritoResponse> {
    const sessionId = this.getIdSesion();
    const params = new HttpParams().set('sessionId', sessionId);

    return this.http.get<CarritoResponse>(this.apiUrl, { params }).pipe(
      tap(carrito => {
        const normalizado: CarritoResponse = {
          ...carrito,
          total: carrito.total ?? carrito.subtotal
        };
        this.carritoState.set(normalizado);
        this.contadorProdsState.set(normalizado.totalProductos);
        this.guardarEnStorage(normalizado);
      })
    );
  }

  agregarAlCarrito(request: CarritoProdRequest): Observable<CarritoProd> {
    const sessionId = this.getIdSesion();
    const requestConSesion = { ...request, idSesion: sessionId };

    return this.http.post<CarritoProd>(this.apiUrl, requestConSesion).pipe(
      tap(() => {
        this.cargarCarrito().subscribe();
      })
    );
  }

  actualizarCantidad(carritoId: number, cantidad: number): Observable<CarritoProd> {
    return this.http.put<CarritoProd>(`${this.apiUrl}/${carritoId}`, { cantidad }).pipe(
      tap(() => {
        this.cargarCarrito().subscribe();
      })
    );
  }

  eliminarDelCarrito(carritoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${carritoId}`).pipe(
      tap(() => {
        this.cargarCarrito().subscribe();
      })
    );
  }


  transferirCarrito(): Observable<void> {
    const sessionId = this.getIdSesion();
    const params = new HttpParams().set('sessionId', sessionId);

    return this.http.post<void>(`${this.apiUrl}/transfer`, {}, { params }).pipe(
      tap(() => {
        localStorage.removeItem('cart_session_id');
        this.cargarCarrito().subscribe();
      })
    );
  }

  resetLocal(): void {
    this.carritoState.set(null);
    this.contadorProdsState.set(0);
    localStorage.removeItem('cart_snapshot');
    localStorage.removeItem('cart_session_id');
  }
}

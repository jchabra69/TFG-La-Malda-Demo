import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  Producto,
  ProductoFormulario,
  ProductoImagen,
  ProductoVariante
} from '../models/producto.model';
import { PageResponse } from '../models/paginacion.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/products`;

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(map(arr => arr.map(p => this.mapProducto(p))));
  }

  obtenerPorSlug(slug: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/slug/${slug}`).pipe(map(p => this.mapProducto(p)));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(map(p => this.mapProducto(p)));
  }

  getProductoPorSlug(slug: string): Observable<Producto> {
    return this.obtenerPorSlug(slug);
  }

  getProductoPorId(id: number): Observable<Producto> {
    return this.obtenerPorId(id);
  }

  getNovedades(): Observable<Producto[]> {
    return this.listar();
  }

  getPorCategoria(categoriaId: number, page = 0, size = 20): Observable<PageResponse<Producto>> {
    return this.listar().pipe(
      map(productos => {
        const filtrados = productos.filter(p => p.categoriaId === categoriaId);
        const inicio = page * size;
        const contenido = filtrados.slice(inicio, inicio + size);
        return {
          contenido,
          totalElementos: filtrados.length,
          totalPaginas: Math.max(1, Math.ceil(filtrados.length / size)),
          tamanio: size,
          number: page
        };
      })
    );
  }

  crear(payload: ProductoFormulario): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, payload).pipe(map(p => this.mapProducto(p)));
  }

  actualizar(id: number, payload: ProductoFormulario): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, payload).pipe(map(p => this.mapProducto(p)));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  plantillaVariante(): ProductoVariante {
    return {
      talla: '',
      color: '',
      stock: 0
    };
  }

  plantillaImagen(): ProductoImagen {
    return {
      url: '',
      esPrincipal: false,
      orden: 0
    };
  }

  private mapProducto(raw: any): Producto {
    const variantes = (raw.variantes ?? []).map((v: any) => ({
      id: v.id,
      talla: v.talla,
      color: v.color,
      stock: v.stock ?? 0
    }));
    const imagenes = (raw.imagenes ?? []).map((img: any, index: number) => ({
      id: img.id,
      url: img.url,
      esPrincipal: img.esPrincipal ?? index === 0,
      orden: img.orden ?? index
    }));
    const producto: Producto = {
      id: raw.id,
      nombre: raw.nombre,
      slug: raw.slug,
      descripcion: raw.descripcion,
      precio: raw.precio,
      destacado: Boolean(raw.destacado),
      imagenPrincipal: raw.imagenPrincipal ?? raw.imagenUrl,
      categoriaId: raw.categoriaId,
      variantes,
      imagenes
    };
    return producto;
  }
}

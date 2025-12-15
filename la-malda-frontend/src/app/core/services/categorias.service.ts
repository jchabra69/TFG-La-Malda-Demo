import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Categoria, CategoriaFormulario } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getActivas(): Observable<Categoria[]> {
    return this.listar();
  }

  getCategoriasPrincipales(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/main`);
  }

  getCategoriaPorSlug(slug: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/slug/${slug}`);
  }

  getSubcategorias(id: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/${id}/subcategories`);
  }

  listarAdmin(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  crear(payload: CategoriaFormulario): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, payload);
  }

  actualizar(id: number, payload: CategoriaFormulario): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  arbolCategorias(categorias: Categoria[]): Categoria[] {
    const mapa = new Map<number, Categoria & { subcategorias: Categoria[] }>();
    const raiz: (Categoria & { subcategorias: Categoria[] })[] = [];

    categorias.forEach(cat => {
      mapa.set(cat.id, { ...cat, subcategorias: [] });
    });

    mapa.forEach(cat => {
      if (cat.idCategoriaPadre && mapa.has(cat.idCategoriaPadre)) {
        mapa.get(cat.idCategoriaPadre)!.subcategorias!.push(cat);
      } else {
        raiz.push(cat);
      }
    });

    return raiz;
  }
}

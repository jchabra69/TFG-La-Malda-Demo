import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ImagenesWebpArchivo {
  nombreArchivo: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagenesWebpService {
  private api = `${environment.apiUrl}/admin/imagenes-webp`;
  private base = environment.apiUrl.replace(/\/api$/, '');

  constructor(private http: HttpClient) {}

  subir(archivo: File): Observable<ImagenesWebpArchivo> {
    const form = new FormData();
    form.append('file', archivo);
    return this.http.post<ImagenesWebpArchivo>(this.api, form).pipe(
      map(res => ({
        ...res,
        url: res.url?.startsWith('http') ? res.url : (res.url ? `${this.base}${res.url}` : ''),
        nombreArchivo: (res.nombreArchivo || '').trim() || this.extraerNombre(res.url)
      }))
    );
  }

  private extraerNombre(url: string): string {

    if (!url) return '';
    try {
      const partes = url.split('/').filter(Boolean);

      return decodeURIComponent(partes[partes.length - 1] || '');

    } catch {
      return url;
    }
  }
}

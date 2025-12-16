import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Producto, ProductoImagen } from '../../core/models/producto.model';
import { environment } from '../../../environments/environment.development';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './tarjeta-producto.component.html',
  styleUrls: ['./tarjeta-producto.component.scss']
})
export class TarjetaProductoComponent {
  @Input({ required: true }) product!: Producto;
  @Input() mostrarNuevo = true;
  @Input() mostrarDestacado = true;
  estaEnHover = false;

  tieneImagenDisponible(): boolean {
    return Boolean(
      this.product?.imagenPrincipal ||
        (this.product?.imagenes && this.product.imagenes.length > 0)
    );
  }

  activarHover(): void {
    this.estaEnHover = true;
  }

  desactivarHover(): void {
    this.estaEnHover = false;
  }

  getImagenUrl(): string {
    const { url } = this.getImagenActual();
    if (url?.includes('errorImagen.svg')) return 'assets/Errores/errorImagen.svg';
    if (!url) return 'assets/Errores/errorImagen.svg';
    return this.normalizarUrl(url);
  }

  getFallbackUrl(): string | undefined {
    const { fallback } = this.getImagenActual();
    const fb = fallback;
    if (!fb) return undefined;
    if (fb.includes('errorImagen.svg')) return 'assets/Errores/errorImagen.svg';
    return this.normalizarUrl(fb);
  }

  errorImagen(event: Event, fallback?: string) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    if (fallback && img.dataset['fbUsed'] !== '1') {
      img.dataset['fbUsed'] = '1';
      img.src = fallback;
      return;
    }
    img.onerror = null;
    img.src = 'assets/Errores/errorImagen.svg';
  }

  private normalizarUrl(src: string): string {
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    const base = environment.apiUrl.replace(/\/api$/, '');
    const limpio = src.startsWith('/') ? src : `/${src}`;
    return `${base}${limpio}`;
  }

  private getImagenActual(): { url?: string; fallback?: string } {
    const galeria: ProductoImagen[] = this.product.imagenes || [];
    const principalUrl = this.product.imagenPrincipal || galeria[0]?.url;

    const principalImagen =
      galeria.find(img => img?.url === principalUrl) ?? (principalUrl ? ({ url: principalUrl } as ProductoImagen) : undefined);

    const secundariaImagen =
      galeria.find(img => img?.url && img.url !== principalUrl) ||
      (galeria.length > 1 ? galeria[1] : galeria[0]);

    const usarSecundaria = this.estaEnHover && secundariaImagen?.url;
    const seleccion = usarSecundaria ? secundariaImagen : principalImagen;

    return {
      url: seleccion?.url || principalUrl,
      fallback: (seleccion as any)?.urlFallback || undefined
    };
  }
}

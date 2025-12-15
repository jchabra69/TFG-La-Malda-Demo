import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../../../../core/services/productos.service';
import { Producto } from '../../../../core/models/producto.model';
import { LucideAngularModule } from 'lucide-angular';

export interface ProductoSpot {
  id: string;
  productId?: number;
  nombre: string;
  slug: string;
  precio: number;
}

export interface CelebSpotlight {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  imagenAuxiliar?: string;
  imagenFallback?: string;
  productos: ProductoSpot[];
  destacada?: boolean; // Ocupa 2x espacio en grid
  nuevo?: boolean; // Badge "NUEVO"
  redes?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

@Component({
  selector: 'app-seccion-celebs',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './seccion-celebs.component.html',
  styleUrls: ['./seccion-celebs.component.scss']
})
export class SeccionCelebsComponent implements OnInit {
  private productosService = inject(ProductosService);
  @Input() celebridades: CelebSpotlight[] = [];
  @Input() titulo = 'Celebs';
  @Input() subtitulo = "Alguno de tus influencers ya confían en La Malda'";
  @Input() mostrarTitulo = true;



  private readonly celebSeed: CelebSpotlight[] = [
    {
      id: 'rakky-ripper',
      nombre: 'Rakky Ripper',
      descripcion: 'Rakky Ripper llevando nuestro NO TIME NECKLACE para el videoclip de Legacy',
      imagen: 'assets/imgs/celebs/Rakky-Ripper-LaMalda.webp',
      imagenAuxiliar: undefined,
      imagenFallback: 'assets/imgs/celebs/Rakky-Ripper-LaMalda.webp',
      destacada: true,
      nuevo: true,
      productos: [
        {
          id: 'rakky-17',
          productId: 17,
          nombre: "NO TIME NECKCLACE'",
          slug: 'collares',
          precio: 0
        }
      ],
      redes: {
        instagram: 'https://www.instagram.com/rakkyripper/',
        tiktok: 'https://www.tiktok.com/@rakkyripper'
      }
    },
    {
      id: 'reyes-santa',
      nombre: 'Reyes Santa',
      descripcion: 'Reyes Santa llevando nuestro NO TIME NECKLACE para El Ascensor Music Session #4',
      imagen: 'assets/imgs/celebs/Reyes-Santa-La-Malda.webp',
      imagenFallback: 'assets/imgs/celebs/Reyes-Santa-La-Malda.webp',
      destacada: true,
      productos: [
        {
          id: 'reyes-17',
          productId: 17,
          nombre: "NO TIME NECKCLACE'",
          slug: 'collares',
          precio: 0
        }
      ],
      redes: {
        instagram: 'https://www.instagram.com/reyessantaa/',
        youtube: 'https://www.youtube.com/channel/UCieTGlZnElQ69IX3fx_293Q'
      }
    }
  ];

  ngOnInit(): void {
    // Asegurar que al menos la primera sea destacada si hay celebridades
    if (this.celebridades.length === 0) {
      this.celebridades = [...this.celebSeed];
    }
    if (this.celebridades.length > 0 && !this.celebridades.some(c => c.destacada)) {
      this.celebridades[0].destacada = true;
    }
    this.cargarMiniaturasDesdeProductos();
  }

  usarFallback(evento: Event, fallback?: string): void {
    const img = evento.target as HTMLImageElement;
    if (!img || !fallback || img.dataset['fallbackUsado'] === '1') return;
    img.src = fallback;
    img.dataset['fallbackUsado'] = '1';
  }

  trackByCelebId(index: number, celeb: CelebSpotlight): string {
    return celeb.id;
  }

  trackByProductoId(index: number, producto: ProductoSpot): string {
    return producto.id;
  }

  private cargarMiniaturasDesdeProductos() {
    const pendientes = new Map<number, ProductoSpot[]>();

    this.celebridades.forEach(celeb => {
      celeb.productos.forEach(prod => {
        if (!prod.productId) return;
        if (!pendientes.has(prod.productId)) pendientes.set(prod.productId, []);
        pendientes.get(prod.productId)!.push(prod);
      });
    });

    pendientes.forEach((spots, productId) => {
      this.productosService.getProductoPorId(productId).subscribe({
        next: (producto: Producto) => this.aplicarDatosProducto(producto, spots),
        error: () => {}
      });
    });
  }

  private aplicarDatosProducto(producto: Producto, spots: ProductoSpot[]) {
    spots.forEach(spot => {
      spot.slug = producto.slug || spot.slug;
      spot.precio = producto.precio ?? spot.precio;
      if (!spot.nombre && producto.nombre) {
        spot.nombre = producto.nombre;
      }
    });
  }

}

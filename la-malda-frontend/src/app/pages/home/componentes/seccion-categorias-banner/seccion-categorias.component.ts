import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Categoria } from '../../../../core/models/categoria.model';

type CategoriaLayout = 'destacada' | 'compacta';

interface CategoriaCard {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcionMeta?: string;
  imagen: string;
  fallbackImagen?: string;
  alt: string;
  prioridad: CategoriaLayout;
  totalProductos?: number;
}

@Component({
  selector: 'app-seccion-categorias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seccion-categorias.component.html',
  styleUrls: ['./seccion-categorias.component.scss']
})
export class SeccionCategoriasComponent implements OnChanges {
  private router = inject(Router);
  @Input() categorias: Categoria[] = [];
  @Input() cargando = false;


  private readonly categoriasBase: CategoriaCard[] = [
    {
      id: 'mujer',
      nombre: 'Mujer',
      slug: 'mujer',
      descripcion: 'Ropa y accesorios para mujer.',
      descripcionMeta:
        'Colección de moda femenina La Malda: vestidos, básicos y prendas que combinan estilo y comodidad.',
      imagen: 'assets/imgs/categorias/LaMalda-Mujer.webp',
      fallbackImagen: 'assets/imgs/categorias/LaMalda-Mujer.webp',
      alt: 'Moda mujer La Malda con looks versátiles y actuales',
      prioridad: 'destacada'
    },
    {
      id: 'hombre',
      nombre: 'Hombre',
      slug: 'hombre',
      descripcion: 'Ropa y accesorios para hombre.',
      descripcionMeta:
        'Colección masculina de La Malda con básicos premium y novedades para hombre.',
      imagen: 'assets/imgs/categorias/LaMalda-Hombre.webp',
      fallbackImagen: 'assets/imgs/categorias/LaMalda-Hombre.webp',
      alt: 'Moda hombre La Malda en ambientes urbanos',
      prioridad: 'compacta'
    },
    {
      id: 'accesorios',
      nombre: 'Accesorios',
      slug: 'accesorios',
      descripcion: 'Pañuelos y complementos clave para rematar tus looks.',
      descripcionMeta:
        'Accesorios La Malda: complementos versátiles para elevar cualquier outfit.',
      imagen: 'assets/imgs/categorias/LaMalda-Accesorios.webp',
      fallbackImagen: 'assets/imgs/categorias/LaMalda-Accesorios.webp',
      alt: 'Accesorios La Malda presentados en exteriores',
      prioridad: 'compacta'
    }
  ];

  categoriasDestacadas: CategoriaCard[] = [...this.categoriasBase];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categorias']) {
      this.mapearCategorias();
    }
  }

  private mapearCategorias(): void {
    if (!this.categorias?.length) {
      this.categoriasDestacadas = [...this.categoriasBase];
      return;
    }

    this.categoriasDestacadas = this.categoriasBase.map((base) => {
      const encontrada = this.buscarCoincidencia(base.id);

      if (!encontrada) {
        return base;
      }

      return {
        ...base,
        nombre: encontrada.nombre ?? base.nombre,
        slug: encontrada.slug ?? base.slug,
        descripcion: encontrada.descripcion ?? encontrada.descripcionMeta ?? base.descripcion,
        descripcionMeta:
          encontrada.descripcionMeta ?? encontrada.descripcion ?? base.descripcionMeta,
        totalProductos: encontrada.totalProductos,
        fallbackImagen: encontrada.urlFallback ?? base.fallbackImagen
      };
    });
  }

  private buscarCoincidencia(id: string): Categoria | undefined {
    const clave = this.normalizar(id);

    return this.categorias.find((categoria) => {
      const slug = this.normalizar(categoria.slug);
      const nombre = this.normalizar(categoria.nombre);
      const genero = this.normalizar(categoria.genero);

      return slug === clave || nombre.includes(clave) || genero === clave;
    });
  }

  private normalizar(valor?: string | null): string {
    return valor
      ? valor
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      : '';
  }

  usarFallback(evento: Event, fallback?: string) {
    const img = evento.target as HTMLImageElement;
    if (!img || !fallback || img.dataset['fallbackUsado'] === '1') return;
    img.src = fallback;
    img.dataset['fallbackUsado'] = '1';
  }

  irACatalogoPorGenero(genero: 'mujer' | 'hombre') {
    this.router.navigate(['/catalogo'], { queryParams: { categoriaSlug: genero } });
  }

  irACatalogoAccesorios() {
    const slugs = this.obtenerSlugsAccesorios();
    this.router.navigate(['/catalogo'], {
      queryParams: { multipleCategoriaSlug: slugs.join(',') }
    });
  }

  private obtenerSlugsAccesorios(): string[] {
    const slugs = new Set<string>();

    const recorrer = (lista?: Categoria[]) => {
      if (!lista) return;
      lista.forEach(cat => {
        const texto = `${cat.nombre ?? ''} ${cat.slug ?? ''}`.toLowerCase();
        if (texto.includes('accesorio')) {
          slugs.add(cat.slug);
        }
        if (cat.subcategorias?.length) {
          recorrer(cat.subcategorias);
        }
      });
    };

    recorrer(this.categorias);

    if (slugs.size === 0) {
      slugs.add('accesorios-hombre');
      slugs.add('accesorios-mujer');
    }

    return Array.from(slugs);
  }
}

import { Component, OnInit, signal, inject, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { CategoriasService } from '../../core/services/categorias.service';
import { Categoria } from '../../core/models/categoria.model';
import { CarritoService } from '../../core/services/carrito.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoriasService);
  private miniCloseTimeout: any = null;
  private userCloseTimeout: any = null;

  menuAbierto = false;
  miniCarritoAbierto = signal(false);
  userMenuAbierto = signal(false);

  megaMenuAbierto = signal<string | null>(null);
  megaLateralAbierto = signal<string | null>(null);
  categoriasMujer = signal<Categoria[]>([]);
  categoriasHombre = signal<Categoria[]>([]);
  categoriasNinos = signal<Categoria[]>([]);
  bannerCelebs = {
    img: 'assets/imgs/mega-menu/Reyes-Santa-MegaMenu.webp',
    alt: 'Editorial especial La Malda'
  };
  tarjetasDecorativas = [
    {
      img: 'assets/imgs/mega-menu/LaMalda_Revenant_.webp',
      alt: 'Colección cápsula Revenant'
    },
    {
      img: 'assets/imgs/mega-menu/I-LOVE-FAKES-NEW.webp',
      alt: 'I Love Fakes editorial'
    },
    {
      img: 'assets/imgs/mega-menu/BIKINIS_LA_MALDA_CULTURE-38.webp',
      alt: 'Campaña bikinis La Malda'
    }
  ];

  seccionMovilAbierta: string | null = null;
  mostrarLogotipo = true;
  padresExpandidosMegaMenu = signal<string | null>(null);
  hijasExpandidasMegaMenu = signal<string | null>(null);
  enlaceMegaActivo = signal<string | null>(null);

  arbolLateralExpandido = signal<Set<string>>(new Set());
  slugSeleccionado  = signal<string | null>(null);

  constructor(
    public authService: AutenticacionService,
    private modalService: ModalService,
    public carritoService: CarritoService
  ) {}

  ngOnInit() {

    this.cargarCategorias();
    this.actualizarVisibilidadLogotipo();
  }

  cargarCategorias() {
    this.categoryService.getActivas().subscribe({
      next: (cats: Categoria[]) => {
        console.log('Categorías recibidas:', cats);
        const { mujer, hombre, ninos } = this.apartadosPorGenero(cats || []);
        console.log('Categorías Mujer:', mujer);
        console.log('Categorías Hombre:', hombre);
        this.categoriasMujer.set(mujer);
        this.categoriasHombre.set(hombre);
        this.categoriasNinos.set(ninos);

      },
      error: (err: unknown) => console.error('Error al cargar categorías:', err)
    });
  }

  private apartadosPorGenero(cats: Categoria[]) {
    const buckets: Record<'MUJER' | 'HOMBRE' | 'NINOS', Categoria[]> = {
      MUJER: [],
      HOMBRE: [],
      NINOS: []
    };

    const mapaCategorias = new Map<number, Categoria>();
    cats.forEach(cat => mapaCategorias.set(cat.id, cat));

    const inferirPorNombre = (cat: Categoria): 'MUJER' | 'HOMBRE' | 'NINOS' | null => {
      const texto = `${cat.nombre ?? ''} ${cat.slug ?? ''}`.toLowerCase();
      if (texto.includes('mujer')) return 'MUJER';
      if (texto.includes('hombre')) return 'HOMBRE';
      if (texto.includes('nino') || texto.includes('niño') || texto.includes('niña') || texto.includes('infantil')) return 'NINOS';
      return null;
    };

    const cacheGenero = new Map<number, 'MUJER' | 'HOMBRE' | 'NINOS' | 'UNISEX' | null>();
    const resolverGenero = (cat?: Categoria | null): 'MUJER' | 'HOMBRE' | 'NINOS' | 'UNISEX' | null => {
      if (!cat) return null;
      if (cacheGenero.has(cat.id)) {
        return cacheGenero.get(cat.id)!;
      }
      const directo = this.normalizarGenero(cat.genero);
      if (directo) {
        cacheGenero.set(cat.id, directo);
        return directo;
      }
      if (cat.idCategoriaPadre && mapaCategorias.has(cat.idCategoriaPadre)) {
        const heredado = resolverGenero(mapaCategorias.get(cat.idCategoriaPadre));
        if (heredado) {
          cacheGenero.set(cat.id, heredado);
          return heredado;
        }
      }
      const deducido = inferirPorNombre(cat);
      cacheGenero.set(cat.id, deducido);
      return deducido;
    };

    cats.forEach(cat => {
      const genero = resolverGenero(cat);
      if (genero === 'UNISEX') {
        buckets.MUJER.push(cat);
        buckets.HOMBRE.push(cat);
        buckets.NINOS.push(cat);
      } else if (genero) {
        buckets[genero].push(cat);
      }
    });

    const ordenarArbol = (nodos: Categoria[]): Categoria[] => {
      const ordenados = [...nodos].sort((a, b) => {
        const oa = a.orden ?? 9999;
        const ob = b.orden ?? 9999;
        if (oa !== ob) return oa - ob;
        return (a.nombre || '').localeCompare(b.nombre || '');
      }).map(node => ({
        ...node,
        subcategorias: node.subcategorias ? ordenarArbol(node.subcategorias) : []
      }));
      return ordenados;
    };

    const filtrarConProductos = (nodos: Categoria[]): Categoria[] => {
      return nodos
        .map(node => ({
          ...node,
          subcategorias: node.subcategorias ? filtrarConProductos(node.subcategorias) : []
        }))
        .filter(node => (node.totalProductos ?? 0) > 0 || (node.subcategorias?.length ?? 0) > 0);
    };

    const mujer = filtrarConProductos(ordenarArbol(this.categoryService.arbolCategorias(buckets.MUJER)));
    const hombre = filtrarConProductos(ordenarArbol(this.categoryService.arbolCategorias(buckets.HOMBRE)));
    const ninos = filtrarConProductos(ordenarArbol(this.categoryService.arbolCategorias(buckets.NINOS)));

    return { mujer, hombre, ninos };
  }


  private normalizarGenero(valor?: string | null): 'MUJER' | 'HOMBRE' | 'NINOS' | 'UNISEX' | null {
    if (!valor) return null;
    const v = valor.toString().trim().toUpperCase();
    if (['MUJER', 'WOMEN', 'FEMALE', 'M'].includes(v)) return 'MUJER';
    if (['HOMBRE', 'MEN', 'MALE', 'H'].includes(v)) return 'HOMBRE';
    if (['NINO', 'NINA', 'NIÑO', 'NIÑA', 'NINOS', 'NINAS', 'KIDS', 'KID', 'N'].includes(v)) return 'NINOS';
    if (['UNISEX', 'UNISEXOS', 'UNI'].includes(v)) return 'UNISEX';
    return null;
  }

  private buscarSlugCategoriaPorNombre(categories: Categoria[], name: string): string | null {
    const target = name.toLowerCase();

    const dfs = (nodes: Categoria[] | undefined): string | null => {
      if (!nodes) return null;
      for (const node of nodes) {
        if (node.nombre?.toLowerCase() === target && node.slug) {
          return node.slug;
        }
        const nested = dfs(node.subcategorias);
        if (nested) return nested;
      }
      return null;
    };

    return dfs(categories);
  }

  private getSlugRopaPorGenero(genero: string): string | null {
    const nombresRopa = ['Clothing', 'Ropa'];
    if (genero === 'MUJER') {
      return nombresRopa
        .map(name => this.buscarSlugCategoriaPorNombre(this.categoriasMujer(), name))
        .find(Boolean) || null;
    }
    if (genero === 'HOMBRE') {
      return nombresRopa
        .map(name => this.buscarSlugCategoriaPorNombre(this.categoriasHombre(), name))
        .find(Boolean) || null;
    }
    if (genero === 'NINOS') {
      return nombresRopa
        .map(name => this.buscarSlugCategoriaPorNombre(this.categoriasNinos(), name))
        .find(Boolean) || null;
    }
    return null;
  }


  alternarPadreMega(slug?: string | null) {
    if (!slug) return;
    this.padresExpandidosMegaMenu.set(this.padresExpandidosMegaMenu() === slug ? null : slug);
  }
  padreMegaExpandidoEs(slug?: string | null): boolean {
    if (!slug) return false;
    return this.padresExpandidosMegaMenu() === slug;
  }

  alternarHijoMega(slug?: string | null) {
    if (!slug) return;
    this.hijasExpandidasMegaMenu.set(this.hijasExpandidasMegaMenu() === slug ? null : slug);
  }

  hijoMegaExpandidoEs(slug?: string | null): boolean {
    if (!slug) return false;
    return this.hijasExpandidasMegaMenu() === slug;
  }

  // Mega lateral
  abrirMegaLateral(gender: string) {
    this.megaLateralAbierto.set(gender);

    const defaults = new Set<string>();
    const clothingSlug = this.getSlugRopaPorGenero(gender);
    if (clothingSlug) {
      defaults.add(clothingSlug);
    }
    this.arbolLateralExpandido.set(defaults);
    this.slugSeleccionado.set(null);
  }

  alternarMegaLateral(gender: string) {
    if (this.megaLateralAbierto() === gender) {
      this.megaLateralAbierto.set(null);
      return;
    }
    this.abrirMegaLateral(gender);
  }

  cerrarMegaLateral() {
    this.megaLateralAbierto.set(null);
  }

  megaLateralEstaAbierto(gender: string): boolean {
    return this.megaLateralAbierto() === gender;
  }

  // Eventos globales
  @HostListener('document:keydown.escape')
  alPresionarEscape() { this.cerrarMegaLateral(); }

  @HostListener('window:scroll')
  alHacerScroll() { this.actualizarVisibilidadLogotipo(); }

  private actualizarVisibilidadLogotipo() {
    if (typeof window === 'undefined') return;
    const isPantallaPequena = window.innerWidth <= 1024;
    const shouldShow = isPantallaPequena ? true : window.scrollY <= 4;
    if (this.mostrarLogotipo !== shouldShow) this.mostrarLogotipo = shouldShow;
  }
  alternarMenu() { this.menuAbierto = !this.menuAbierto; }
  cerrarMenu() { this.menuAbierto = false; }

  abrirModalAuth() { this.modalService.abrirLogin(); }

  alternarSeccionMovil(gender: string) {
    this.seccionMovilAbierta = this.seccionMovilAbierta === gender ? null : gender;
  }
  seccionMovilEstaAbierta(gender: string): boolean {
    return this.seccionMovilAbierta === gender;
  }

  cerrarSesion() {
    this.authService.logout();
  }

  abrirMiniCarrito() {
    if (this.miniCloseTimeout) {
      clearTimeout(this.miniCloseTimeout);
      this.miniCloseTimeout = null;
    }
    this.miniCarritoAbierto.set(true);
  }

  cerrarMiniCarrito() {
    if (this.miniCloseTimeout) {
      clearTimeout(this.miniCloseTimeout);
    }
    this.miniCloseTimeout = setTimeout(() => {
      this.miniCarritoAbierto.set(false);
    }, 200);
  }

  mantenerMiniCarritoAbierto() {
    if (this.miniCloseTimeout) {
      clearTimeout(this.miniCloseTimeout);
      this.miniCloseTimeout = null;
    }
    this.miniCarritoAbierto.set(true);
  }

  eliminarDelMiniCarrito(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.carritoService.eliminarDelCarrito(id).subscribe();
  }

  abrirUserMenu() {
    if (this.userCloseTimeout) {
      clearTimeout(this.userCloseTimeout);
      this.userCloseTimeout = null;
    }
    this.userMenuAbierto.set(true);
  }

  cerrarUserMenu() {
    if (this.userCloseTimeout) {
      clearTimeout(this.userCloseTimeout);
    }
    this.userCloseTimeout = setTimeout(() => {
      this.userMenuAbierto.set(false);
    }, 200);
  }

  mantenerUserMenuAbierto() {
    if (this.userCloseTimeout) {
      clearTimeout(this.userCloseTimeout);
      this.userCloseTimeout = null;
    }
    this.userMenuAbierto.set(true);
  }

  ngOnDestroy(): void {
    if (this.miniCloseTimeout) {
      clearTimeout(this.miniCloseTimeout);
    }
    if (this.userCloseTimeout) {
      clearTimeout(this.userCloseTimeout);
    }
  }
}

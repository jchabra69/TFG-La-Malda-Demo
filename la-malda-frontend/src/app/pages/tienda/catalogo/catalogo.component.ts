import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { TarjetaProductoComponent } from '../../../global/tarjetas-productos/tarjeta-producto.component';
import { ProductosService } from '../../../core/services/productos.service';
import { CategoriasService } from '../../../core/services/categorias.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    TarjetaProductoComponent
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  private servicioProductos = inject(ProductosService);
  private servicioCategorias = inject(CategoriasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  private categoriasOriginal: Categoria[] = [];
  private categoriaSlugsPendientes: string[] = [];

  cargando = true;
  busqueda = '';
  categoriaSeleccionada: number | null = null;
  categoriasSeleccionadasExtras: number[] = [];
  menuCategoriaAbierto = false;

  ordenSeleccionado = 'relevancia';
  opcionesOrden = [
    { valor: 'relevancia', etiqueta: 'Más relevantes' },
    { valor: 'precio-asc', etiqueta: 'Precio: Menor a Mayor' },
    { valor: 'precio-desc', etiqueta: 'Precio: Mayor a Menor' },
    { valor: 'nombre-asc', etiqueta: 'Nombre: A-Z' },
    { valor: 'nombre-desc', etiqueta: 'Nombre: Z-A' }
  ];

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();

    this.route.queryParams.subscribe(params => {
      this.categoriasSeleccionadasExtras = [];
      const categoriaParam = params['categoria'];
      const categoriaSlugParam = params['categoriaSlug'];
      const multipleSlugParam = params['multipleCategoriaSlug'];

      if (categoriaParam) {
        if (Array.isArray(categoriaParam)) {
          const id = parseInt(categoriaParam[0], 10);
          this.categoriaSeleccionada = isNaN(id) ? null : id;
        } else {
          const id = parseInt(categoriaParam, 10);
          this.categoriaSeleccionada = isNaN(id) ? null : id;
        }
      } else {
        this.categoriaSeleccionada = null;
      }

      this.categoriaSlugsPendientes = [];
      const recolectarSlugs = (valor: unknown) => {
        if (!valor) return;
        if (Array.isArray(valor)) {
          valor.forEach(item => recolectarSlugs(item));
        } else if (typeof valor === 'string') {
          valor.split(',').forEach(slug => {
            const limpio = slug.trim();
            if (limpio) {
              this.categoriaSlugsPendientes.push(limpio);
            }
          });
        }
      };

      recolectarSlugs(categoriaSlugParam);
      recolectarSlugs(multipleSlugParam);

      if (params['busqueda']) {
        this.busqueda = params['busqueda'];
      }
      this.aplicarFiltros();
      this.intentarAplicarSlugPendiente();
    });
  }

  cargarCategorias() {
    this.servicioCategorias.listar().subscribe({
      next: (cats) => {
        this.categoriasOriginal = this.servicioCategorias.arbolCategorias(cats);
        this.actualizarCategoriasDisponibles();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.servicioProductos.listar().subscribe({
      next: (prods) => {
        this.productos = prods;
        this.aplicarFiltros();
        this.actualizarCategoriasDisponibles();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.productos];

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino)
      );
    }

    const idsFiltro = this.obtenerIdsFiltroActivos();
    if (idsFiltro.length) {
      resultado = resultado.filter(p =>
        idsFiltro.some(id => this.perteneceCategoriaOSubcategoria(p.categoriaId, id))
      );
    }

    this.productosFiltrados = this.ordenarProductos(resultado);
  }

  perteneceCategoriaOSubcategoria(categoriaProductoId: number, categoriaFiltroId: number): boolean {
    if (categoriaProductoId === categoriaFiltroId) return true;

    const categoria = this.buscarCategoriaPorId(categoriaFiltroId, this.categorias);
    if (!categoria) return false;

    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      return categoria.subcategorias.some(sub =>
        this.perteneceCategoriaOSubcategoria(categoriaProductoId, sub.id)
      );
    }

    return false;
  }

  buscarCategoriaPorId(id: number, lista: Categoria[]): Categoria | undefined {
    for (const cat of lista) {
      if (cat.id === id) return cat;
      if (cat.subcategorias) {
        const encontrada = this.buscarCategoriaPorId(id, cat.subcategorias);
        if (encontrada) return encontrada;
      }
    }
    return undefined;
  }

  ordenarProductos(productos: Producto[]): Producto[] {
    const copia = [...productos];

    switch (this.ordenSeleccionado) {
      case 'precio-asc':
        return copia.sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return copia.sort((a, b) => b.precio - a.precio);
      case 'nombre-asc':
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre-desc':
        return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
      default:
        return copia.sort((a, b) => {
          if (a.destacado && !b.destacado) return -1;
          if (!a.destacado && b.destacado) return 1;
          return 0;
        });
    }
  }

  private obtenerIdsFiltroActivos(): number[] {
    const ids = new Set<number>();
    if (this.categoriaSeleccionada !== null) {
      ids.add(this.categoriaSeleccionada);
    }
    this.categoriasSeleccionadasExtras.forEach(id => ids.add(id));
    return Array.from(ids);
  }

  esCategoriaActiva(id: number): boolean {
    return this.categoriaSeleccionada === id || this.categoriasSeleccionadasExtras.includes(id);
  }

  alCambiarBusqueda() {
    this.actualizarUrl();
    this.aplicarFiltros();
  }

  seleccionarCategoria(categoriaId: number | null) {
    this.categoriaSeleccionada = categoriaId;
    this.categoriasSeleccionadasExtras = [];
    this.actualizarUrl();
    this.aplicarFiltros();
  }

  alCambiarOrden() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.categoriaSeleccionada = null;
    this.categoriasSeleccionadasExtras = [];
    this.ordenSeleccionado = 'relevancia';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.aplicarFiltros();
  }

  cambiarEstadoMenuCategoria() {
    this.menuCategoriaAbierto = !this.menuCategoriaAbierto;
  }

  private actualizarUrl() {
    const params: any = {};
    if (this.categoriaSeleccionada !== null) {
      params.categoria = this.categoriaSeleccionada;
    }
    if (this.categoriasSeleccionadasExtras.length) {
      const slugs = this.categoriasSeleccionadasExtras
        .map(id => this.buscarCategoriaPorId(id, this.categorias)?.slug)
        .filter((slug): slug is string => !!slug);
      if (slugs.length) {
        params.multipleCategoriaSlug = slugs.join(',');
      }
    }
    if (this.busqueda.trim()) {
      params.busqueda = this.busqueda;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  private actualizarCategoriasDisponibles() {
    if (!this.categoriasOriginal.length) {
      this.categorias = [];
      return;
    }

    if (!this.productos.length) {
      this.categorias = [...this.categoriasOriginal];
      this.intentarAplicarSlugPendiente();
      return;
    }

    const filtradas = this.filtrarCategoriasConProductos(this.categoriasOriginal);
    this.categorias = filtradas;
    this.intentarAplicarSlugPendiente();

    this.categoriasSeleccionadasExtras = this.categoriasSeleccionadasExtras
      .filter(id => this.existeCategoriaEnLista(id, filtradas));

    if (
      this.categoriaSeleccionada !== null &&
      !this.existeCategoriaEnLista(this.categoriaSeleccionada, filtradas)
    ) {
      this.categoriaSeleccionada = null;
      this.actualizarUrl();
      this.aplicarFiltros();
    }
  }

  private filtrarCategoriasConProductos(lista: Categoria[]): Categoria[] {
    const resultado: Categoria[] = [];

    for (const categoria of lista) {
      const subFiltradas = categoria.subcategorias
        ? this.filtrarCategoriasConProductos(categoria.subcategorias)
        : [];

      const tieneProductos = this.categoriaTieneProductos(categoria.id);

      if (tieneProductos || subFiltradas.length > 0) {
        resultado.push({
          ...categoria,
          subcategorias: subFiltradas
        });
      }
    }

    return resultado;
  }

  private categoriaTieneProductos(categoriaId: number): boolean {
    return this.productos.some(p => p.categoriaId === categoriaId);
  }

  private existeCategoriaEnLista(id: number, lista: Categoria[]): boolean {
    for (const categoria of lista) {
      if (categoria.id === id) {
        return true;
      }
      if (categoria.subcategorias && categoria.subcategorias.length > 0) {
        const encontrada = this.existeCategoriaEnLista(id, categoria.subcategorias);
        if (encontrada) {
          return true;
        }
      }
    }
    return false;
  }

  private intentarAplicarSlugPendiente() {
    if (!this.categoriaSlugsPendientes.length || !this.categoriasOriginal.length) {
      return;
    }

    const ids: number[] = [];
    this.categoriaSlugsPendientes.forEach(slug => {
      const categoria = this.buscarCategoriaPorSlug(slug, this.categoriasOriginal);
      if (categoria) {
        ids.push(categoria.id);
      }
    });

    if (ids.length) {
      this.categoriaSeleccionada = ids[0];
      this.categoriasSeleccionadasExtras = ids.slice(1);
      this.actualizarUrl();
      this.aplicarFiltros();
    }
    this.categoriaSlugsPendientes = [];
  }

  private buscarCategoriaPorSlug(slug: string, lista: Categoria[]): Categoria | undefined {
    const referencia = slug.trim().toLowerCase();
    for (const cat of lista) {
      if (cat.slug?.toLowerCase() === referencia) {
        return cat;
      }
      if (cat.subcategorias?.length) {
        const encontrada = this.buscarCategoriaPorSlug(slug, cat.subcategorias);
        if (encontrada) {
          return encontrada;
        }
      }
    }
    return undefined;
  }

  getNombreCategoria(id: number): string {
    const cat = this.buscarCategoriaPorId(id, this.categorias);
    return cat?.nombre || '';
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Producto, ProductoVariante } from '../../../core/models/producto.model';
import { CarritoService } from '../../../core/services/carrito.service';
import { ProductosService } from '../../../core/services/productos.service';
import { CarritoProdRequest } from '../../../core/models/carrito.model';
import { PageResponse } from '../../../core/models/paginacion.model';
import { TarjetaProductoComponent } from '../../../global/tarjetas-productos/tarjeta-producto.component';
import { Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { NotificacionesService } from '../../../core/services/notificaciones.service';



@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TarjetaProductoComponent, LucideAngularModule],
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.scss']
})
export class DetalleProductoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productosService = inject(ProductosService);
  private carritoService = inject(CarritoService);
  private title = inject(Title);
  private notificacionesService = inject(NotificacionesService);
  private modalCloseTimeout?: ReturnType<typeof setTimeout>;

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  imagenSeleccionada = signal(0);
  zoomAbierto = signal(false);
  zoomImagenAmpliada = signal(false);

  colorSeleccionado = signal<string | null>(null);
  tallaSeleccionada = signal<string | null>(null);
  varianteSeleccionada = signal<ProductoVariante | null>(null);
  cantidad = signal(1);

  mostrarModalAgregado = signal(false);
  animacionCarrito = signal(false);

  relacionados = signal<Producto[]>([]);
  relacionadosCargando = signal(false);
  relacionadosError = signal<string | null>(null);
  detallesAbierto = signal(false);
  pestanaDetalles = signal<'descripcion' | 'composicion' | 'envios'>('descripcion');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.cargarProducto(slug);
      }
    });
  }

  cargarProducto(slug: string) {
    this.cargando.set(true);
    this.error.set(null);

    this.productosService.getProductoPorSlug(slug).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.title.setTitle(`La Malda | ${producto.nombre}`);
        this.cargando.set(false);
        this.cargarRelacionados(producto);

        if (producto.variantes && producto.variantes.length > 0) {
          const primeraVariante = producto.variantes[0];
          this.colorSeleccionado.set(primeraVariante.color || null);
          this.tallaSeleccionada.set(primeraVariante.talla || null);
          this.varianteSeleccionada.set(primeraVariante);
        }
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.error.set('No se pudo cargar el producto');
        this.cargando.set(false);
      }
    });
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada.set(index);
  }

  getImagenActual(): string {
    const producto = this.producto();
    if (!producto) return '';
    const galeria = producto.imagenes ?? [];
    const imagen = galeria[this.imagenSeleccionada()]?.url || producto.imagenPrincipal;
    return imagen || '';
  }

  hayGaleriaProducto(): boolean {
    return (this.producto()?.imagenes?.length || 0) > 1;
  }

  siguienteImagen() {
    const total = this.producto()?.imagenes?.length || 0;
    if (total <= 1) return;
    const next = (this.imagenSeleccionada() + 1) % total;
    this.imagenSeleccionada.set(next);
  }

  anteriorImagen() {
    const total = this.producto()?.imagenes?.length || 0;
    if (total <= 1) return;
    const prev = (this.imagenSeleccionada() - 1 + total) % total;
    this.imagenSeleccionada.set(prev);
  }

  abrirZoom() {
    this.zoomAbierto.set(true);
    this.zoomImagenAmpliada.set(false);
  }

  cerrarZoom() {
    this.zoomAbierto.set(false);
    this.zoomImagenAmpliada.set(false);
  }

  ponerZoomImagen() {
    this.zoomImagenAmpliada.update(v => !v);
  }

  seleccionarColor(color: string) {
    this.colorSeleccionado.set(color);
    this.actualizarVarianteSeleccionada();
  }

  seleccionarTalla(talla: string) {
    this.tallaSeleccionada.set(talla);
    this.actualizarVarianteSeleccionada();
  }

  private actualizarVarianteSeleccionada() {
    const producto = this.producto();
    if (!producto || !producto.variantes) return;

    const color = this.colorSeleccionado();
    const talla = this.tallaSeleccionada();

    const variante = producto.variantes.find(v =>
      v.color === color && v.talla === talla
    );

    this.varianteSeleccionada.set(variante || null);
  }

  incrementarCantidad() {
    const variante = this.varianteSeleccionada();
    if (variante && this.cantidad() < variante.stock) {
      this.cantidad.update(c => c + 1);
    }
  }

  decrementarCantidad() {
    if (this.cantidad() > 1) {
      this.cantidad.update(c => c - 1);
    }
  }

  agregarAlCarrito() {
    const variante = this.varianteSeleccionada();
    const producto = this.producto();
    if (!producto) {
      this.notificacionesService.notificarError('Producto no disponible');
      return;
    }
    if (!variante) {
      this.notificacionesService.notificarError('Selecciona una talla y color para añadir al carrito.');
      return;
    }

    if (variante.stock < this.cantidad()) {
      this.notificacionesService.notificarError('No hay suficiente stock disponible para esa combinación.');
      return;
    }


    this.animacionCarrito.set(true);

    const request: CarritoProdRequest = {
      productoId: producto.id,
      cantidad: this.cantidad()
    };

    this.carritoService.agregarAlCarrito(request).subscribe({
      next: () => {
        // Mostrar modal de confirmación
        if (this.modalCloseTimeout) clearTimeout(this.modalCloseTimeout);
        setTimeout(() => {
          this.animacionCarrito.set(false);
          this.mostrarModalAgregado.set(true);
        }, 600);

        this.modalCloseTimeout = setTimeout(() => {
          this.mostrarModalAgregado.set(false);
        }, 3000);
      },
      error: (err) => {
        this.animacionCarrito.set(false);
        console.error('Error al agregar al carrito:', err);
        this.notificacionesService.notificarError('No se pudo agregar al carrito. Inténtalo más tarde.');
      }
    });
  }

  cerrarModal() {
    this.mostrarModalAgregado.set(false);
    if (this.modalCloseTimeout) clearTimeout(this.modalCloseTimeout);
  }

  irAlCarrito() {
    this.cerrarModal();
    this.router.navigate(['/carrito']);
  }

  volverInicio() {
    this.router.navigate(['/']);
  }

  obtenerColoresUnicos(): string[] {
    const producto = this.producto();
    if (!producto || !producto.variantes) return [];

    const coloresSet = new Set(
      producto.variantes
        .filter(v => v.color)
        .map(v => v.color!)
    );

    return Array.from(coloresSet);
  }

  obtenerTallasParaColor(color: string): string[] {
    const producto = this.producto();
    if (!producto || !producto.variantes) return [];

    return producto.variantes
      .filter(v => v.color === color)
      .map(v => v.talla!)
      .filter(Boolean);
  }

  getStockDisponible(): number {
    const variante = this.varianteSeleccionada();
    return variante?.stock || 0;
  }

  abrirDetalles(tab: 'descripcion' | 'composicion' | 'envios' = 'descripcion') {
    this.pestanaDetalles.set(tab);
    this.detallesAbierto.set(true);
  }

  cerrarDetalles() {
    this.detallesAbierto.set(false);
  }

  seleccionarPestania(tab: 'descripcion' | 'composicion' | 'envios') {
    this.pestanaDetalles.set(tab);
  }

  private cargarRelacionados(producto: Producto) {
    const categoriaId = producto.categoriaId;
    if (!categoriaId) {
      this.relacionados.set([]);
      return;
    }
    this.relacionadosCargando.set(true);
    this.relacionadosError.set(null);

    // Mostraré hasta 15 productos relacionados
    this.productosService.getPorCategoria(categoriaId, 0, 15).subscribe({
      next: (resp: PageResponse<Producto>) => {
        const lista = (resp?.contenido ?? []).filter(p => p.id !== producto.id).slice(0, 15);
        this.relacionados.set(lista);
        this.relacionadosCargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar relacionados:', err);
        this.relacionadosError.set('No se pudieron cargar productos relacionados.');
        this.relacionadosCargando.set(false);
      }
    });
  }
}

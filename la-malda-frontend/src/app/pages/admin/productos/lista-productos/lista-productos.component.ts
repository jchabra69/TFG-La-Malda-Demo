import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../../../core/services/productos.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { ImagenesWebpService } from '../../../../core/services/imagenes-webp.service';
import {
  Producto,
  ProductoFormulario,
  ProductoImagen,
  ProductoVariante
} from '../../../../core/models/producto.model';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss']
})
export class ListaProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  mostrandoFormulario = signal(false);
  editandoId = signal<number | null>(null);
  cargando = signal(true);
  private readonly MAX_TAMANO_WEBP = 3 * 1024 * 1024;

  validacionVariantesActiva = false;
  form: ProductoFormulario;

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private notificacionesService: NotificacionesService,
    private imagenWebpService: ImagenesWebpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formularioVacio();
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.escucharAccionNueva();
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.productosService.listar().subscribe({
      next: productos => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar los productos');
        this.cargando.set(false);
      }
    });

    this.categoriasService.listarAdmin().subscribe({
      next: categorias => this.categorias.set(categorias),
      error: () => this.notificacionesService.notificarError('No se pudieron cargar las categorías')
    });
  }

  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias().find(c => c.id === categoriaId);
    return categoria?.nombre || 'Sin categoría';
  }

  getStockTotal(producto: Producto): number {
    return producto.variantes.reduce((acc, v) => acc + (v.stock || 0), 0);
  }

  getStockClass(producto: Producto): string {
    const stock = this.getStockTotal(producto);
    if (stock === 0) return 'text-[#dc2626] font-bold';
    if (stock < 10) return 'text-[#ea580c] font-bold';
    return 'text-[#16a34a] font-bold';
  }

  nuevaVariante(): void {
    this.form.variantes = [...this.form.variantes, this.productosService.plantillaVariante()];
  }

  eliminarVariante(index: number): void {
    this.form.variantes = this.form.variantes.filter((_, i) => i !== index);
  }

  nuevaImagen(): void {
    this.form.imagenes = [...this.form.imagenes, this.productosService.plantillaImagen()];
  }

  eliminarImagen(index: number): void {
    this.form.imagenes = this.form.imagenes.filter((_, i) => i !== index);
  }

  subirImagenWebp(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!this.validarArchivoWebp(archivo)) {
      input.value = '';
      return;
    }

    this.imagenWebpService.subir(archivo).subscribe({
      next: (archivoSubido) => {
        this.form.imagenes[index].url = archivoSubido.url;
        this.notificacionesService.notificarExito('Imagen subida correctamente');
        input.value = '';
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo subir la imagen .webp');
        input.value = '';
      }
    });
  }

  subirImagenPrincipal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!this.validarArchivoWebp(archivo)) {
      input.value = '';
      return;
    }

    this.imagenWebpService.subir(archivo).subscribe({
      next: (archivoSubido) => {
        this.form.imagenPrincipal = archivoSubido.url;
        this.notificacionesService.notificarExito('Imagen principal subida correctamente');
        input.value = '';
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo subir la imagen principal');
        input.value = '';
      }
    });
  }

  private validarArchivoWebp(archivo: File): boolean {
    const nombre = archivo.name?.toLowerCase() || '';
    const esWebp = nombre.endsWith('.webp') && (archivo.type?.includes('webp') ?? false);
    if (!esWebp) {
      this.notificacionesService.notificarError('Solo se permiten archivos .webp');
      return false;
    }
    if (archivo.size > this.MAX_TAMANO_WEBP) {
      this.notificacionesService.notificarError('La imagen debe pesar menos de 3MB');
      return false;
    }
    return true;
  }

  crear(): void {
    this.form = this.formularioVacio();
    this.editandoId.set(null);
    this.mostrandoFormulario.set(true);
    this.validacionVariantesActiva = false;
  }

  editar(producto: Producto): void {
    this.form = {
      nombre: producto.nombre,
      slug: producto.slug,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoriaId: producto.categoriaId,
      destacado: producto.destacado,
      imagenPrincipal: producto.imagenPrincipal,
      variantes: producto.variantes.map(this.clonarVariante),
      imagenes: producto.imagenes.map(this.clonarImagen)
    };
    this.editandoId.set(producto.id);
    this.mostrandoFormulario.set(true);
    this.validacionVariantesActiva = false;
  }

  guardar(): void {
    const variantesIncompletas = this.form.variantes.some(
      variante => !variante.talla?.trim() || !variante.color?.trim()
    );

    if (variantesIncompletas) {
      this.validacionVariantesActiva = true;
      this.notificacionesService.notificarError('La talla y el color son obligatorios en cada variante.');
      return;
    }

    this.validacionVariantesActiva = false;
    const payload: ProductoFormulario = {
      ...this.form,
      variantes: this.form.variantes.map(v => ({
        ...v,
        talla: v.talla.trim(),
        color: v.color.trim()
      })),
      imagenes: this.form.imagenes
        .filter(img => img.url)
        .map((img, i) => ({
          ...img,
          esPrincipal: false,
          orden: i
        }))
    };

    const operacion = this.editandoId()
      ? this.productosService.actualizar(this.editandoId()!, payload)
      : this.productosService.crear(payload);

    operacion.subscribe({
      next: () => {
        this.notificacionesService.notificarExito(
          this.editandoId() ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
        );
        this.mostrandoFormulario.set(false);
        this.editandoId.set(null);
        this.form = this.formularioVacio();
        this.cargarDatos();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo guardar el producto');
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }
    this.productosService.eliminar(id).subscribe({
      next: () => {
        this.notificacionesService.notificarExito('Producto eliminado correctamente');
        this.cargarDatos();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo eliminar el producto');
      }
    });
  }

  cancelar(): void {
    this.mostrandoFormulario.set(false);
    this.editandoId.set(null);
    this.form = this.formularioVacio();
    this.validacionVariantesActiva = false;
  }

  private escucharAccionNueva(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('action') === 'new') {
        this.crear();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          replaceUrl: true
        });
      }
    });
  }

  private formularioVacio(): ProductoFormulario {
    return {
      nombre: '',
      slug: '',
      descripcion: '',
      precio: 0,
      categoriaId: 0,
      destacado: false,
      imagenPrincipal: '',
      variantes: [],
      imagenes: []
    };
  }

  private clonarVariante(variant: ProductoVariante): ProductoVariante {
    return {
      id: variant.id,
      talla: variant.talla,
      color: variant.color,
      stock: variant.stock
    };
  }

  private clonarImagen(imagen: ProductoImagen): ProductoImagen {
    return {
      id: imagen.id,
      url: imagen.url,
      esPrincipal: false,
      orden: imagen.orden
    };
  }
}

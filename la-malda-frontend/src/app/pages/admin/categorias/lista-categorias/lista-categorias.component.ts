import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { Categoria, CategoriaFormulario } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.scss']
})
export class ListaCategoriasComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  mostrandoFormulario = signal(false);
  editandoId = signal<number | null>(null);
  cargando = signal(true);

  categoriasPadre = computed(() => {
    return this.categorias().filter(c => !c.idCategoriaPadre);
  });

  form: CategoriaFormulario = {
    nombre: '',
    slug: '',
    idCategoriaPadre: null
  };

  constructor(
    private categoriasService: CategoriasService,
    private notificacionesService: NotificacionesService,
    private router: Router,
  private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.escucharAccionNueva();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.categoriasService.listarAdmin().subscribe({
      next: categorias => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar las categorías');
        this.cargando.set(false);
      }
    });
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

  crear(): void {
    this.form = {
      nombre: '',
      slug: '',
      idCategoriaPadre: null
    };
    this.editandoId.set(null);
    this.mostrandoFormulario.set(true);
  }

  editar(categoria: Categoria): void {
    this.form = {
      nombre: categoria.nombre,
      slug: categoria.slug,
      idCategoriaPadre: categoria.idCategoriaPadre ?? null
    };
    this.editandoId.set(categoria.id);
    this.mostrandoFormulario.set(true);
  }

  guardar(): void {
    const operacion = this.editandoId()
      ? this.categoriasService.actualizar(this.editandoId()!, this.form)
      : this.categoriasService.crear(this.form);

    operacion.subscribe({
      next: () => {
        this.notificacionesService.notificarExito(
          this.editandoId() ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente'
        );
        this.cancelar();
        this.cargar();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo guardar la categoría');
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer y podría afectar a los productos asociados.')) {
      return;
    }
    this.categoriasService.eliminar(id).subscribe({
      next: () => {
        this.notificacionesService.notificarExito('Categoría eliminada correctamente');
        this.cargar();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo eliminar la categoría');
      }
    });
  }

  cancelar(): void {
    this.mostrandoFormulario.set(false);
    this.editandoId.set(null);
  }

  getGeneroClass(categoria: Categoria): string {
    if (!categoria.genero) {
      return 'categoria-root';
    }
    const genero = categoria.genero.trim().toLowerCase();
    if (genero.includes('mujer') || genero.includes('femen')) {
      return 'categoria-root categoria-mujer';
    }
    if (genero.includes('hombre') || genero.includes('masc')) {
      return 'categoria-root categoria-hombre';
    }
    return 'categoria-root';
  }
}

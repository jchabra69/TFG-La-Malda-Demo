import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Categoria } from '../../../core/models/categoria.model';
import { Producto } from '../../../core/models/producto.model';
import { CategoriasService } from '../../../core/services/categorias.service';
import { ProductosService } from '../../../core/services/productos.service';
import { TarjetaProductoComponent } from '../../../global/tarjetas-productos/tarjeta-producto.component';
import { PageResponse } from '../../../core/models/paginacion.model';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterModule, TarjetaProductoComponent],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss']
})
export class CategoriaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoriasService = inject(CategoriasService);
  private productosService = inject(ProductosService);
  private title = inject(Title);

  categoria = signal<Categoria | null>(null);
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.cargarCategoria(slug);
      }
    });
  }

  private cargarCategoria(slug: string) {
    this.cargando.set(true);
    this.error.set(null);

    this.categoriasService.getCategoriaPorSlug(slug).subscribe({
      next: (cat: Categoria) => {
        this.categoria.set(cat);
        this.title.setTitle(`La Malda | ${cat.nombre}`);
        this.cargarProductos(cat.id);
      },
      error: (err: unknown) => {
        console.error('Error al cargar categoría:', err);
        this.error.set('No se pudo cargar la categoría');
        this.cargando.set(false);
      }
    });
  }

  private cargarProductos(categoriaId: number) {
    this.productosService.getPorCategoria(categoriaId, 0, 40).subscribe({
      next: (resp: PageResponse<Producto>) => {
        this.productos.set(resp.contenido || []);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        console.error('Error al cargar productos de la categoría:', err);
        this.error.set('No se pudieron cargar los productos de la categoría');
        this.cargando.set(false);
      }
    });
  }
}

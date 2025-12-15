// Home principal de la tienda. Aquí montamos el banner,
// las categorías y los productos destacados/nuevos tirando de los servicios.
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BannerHeroComponent } from './componentes/banner-hero/banner-hero.component';
import { SeccionCategoriasComponent } from './componentes/seccion-categorias-banner/seccion-categorias.component';
import { GridProductosDestacadosComponent } from './componentes/grid-productos-destacados/grid-productos-destacados.component';
import { SeccionCelebsComponent } from './componentes/seccion-celebs/seccion-celebs.component';

import { ProductosService } from '../../core/services/productos.service';
import { CategoriasService } from '../../core/services/categorias.service';

import { Producto } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BannerHeroComponent,
    SeccionCategoriasComponent,
    GridProductosDestacadosComponent,
    SeccionCelebsComponent
  ],
  templateUrl: './home-component.html'
})
export class HomeComponent implements OnInit {


  private servicioProductos = inject(ProductosService);
  private servicioCategorias = inject(CategoriasService);

  productosNuevos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = true;

  ngOnInit() {

    this.cargarDatos();
  }

  cargarDatos() {

    // Novedades
    this.servicioProductos.getNovedades().subscribe({
      next: (products: Producto[]) => {
        const destacados = (products || []).filter(p => p.destacado);
        this.productosNuevos = destacados;
        console.log('Populares (destacados):', destacados);
      },
      error: (err: unknown) => console.error('Error al cargar las novedades:', err)
    });

    // Categorías que yo quiero enseñar en el Home
    this.servicioCategorias.getCategoriasPrincipales().subscribe({
      next: (categories: Categoria[]) => {
        this.categorias = categories;
        this.cargando = false;
        console.log('Categorías cargadadas correctamente:', categories);
      },
      error: (err: unknown) => {
        console.error('Error al cargar categorías:', err);
        this.cargando = false;
      }
    });
  }
}

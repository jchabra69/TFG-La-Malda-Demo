import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TarjetaProductoComponent } from '../../../../global/tarjetas-productos/tarjeta-producto.component';
import { Producto } from '../../../../core/models/producto.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-grid-productos-destacados',
  standalone: true,
  imports: [CommonModule, TarjetaProductoComponent, RouterModule, LucideAngularModule],
  templateUrl: './grid-productos-destacados.component.html',
  styleUrls: ['./grid-productos-destacados.component.scss']
})
export class GridProductosDestacadosComponent {
  @Input() productos: Producto[] = [];
  @Input() titulo: string = 'Favoritos de la temporada';
  @Input() subtitulo?: string;
  @Input() mostrarTitulo = true;
  @Input() mostrarVerTodo = true;
  @Input() maxProductos = 6; // Máximo de productos a mostrar
  @Input() linkVerTodo = '/productos';

  get productosVisibles(): Producto[] {
    return this.productos.slice(0, this.maxProductos);
  }

  get tieneProductos(): boolean {
    return this.productos && this.productos.length > 0;
  }
}

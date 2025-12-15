import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService } from '../../../core/services/carrito.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { AutenticacionService } from '../../../core/services/autenticacion.service';
import { ModalService } from '../../../core/services/modal.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, NgIf, NgFor, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private notificacionesService = inject(NotificacionesService);
  private authService = inject(AutenticacionService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  cargando = signal(true);

  carrito = computed(() => this.carritoService.carrito());

  ngOnInit(): void {
    this.cargarCarrito();
  }

  private cargarCarrito(): void {
    this.cargando.set(true);
    this.carritoService.cargarCarrito().subscribe({
      next: () => this.cargando.set(false),
      error: err => {
        this.cargando.set(false);
        console.error('Error al cargar carrito:', err);
        this.notificacionesService.notificarError('No se pudo cargar tu carrito. Inténtalo más tarde.');
      }
    });
  }

  continuarPedido(): void {
    if (!this.authService.estaAutenticado()) {
      localStorage.setItem('redirectUrl', '/carrito');
      this.modalService.abrirLogin('carrito');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  incrementar(itemId: number, cantidadActual: number) {
    const nueva = cantidadActual + 1;
    this.carritoService.actualizarCantidad(itemId, nueva).subscribe();
  }

  quitar(itemId: number, cantidadActual: number) {
    const nueva = Math.max(1, cantidadActual - 1);
    if (nueva === cantidadActual) return;
    this.carritoService.actualizarCantidad(itemId, nueva).subscribe();
  }

  cambiarCantidadManual(itemId: number, valor: number) {
    const cantidad = Math.max(1, Math.floor(valor));
    this.carritoService.actualizarCantidad(itemId, cantidad).subscribe();
  }

  eliminar(itemId: number) {
    this.carritoService.eliminarDelCarrito(itemId).subscribe();
  }

  trackByItem(_index: number, item: { id: number }): number {
    return item.id;
  }
}

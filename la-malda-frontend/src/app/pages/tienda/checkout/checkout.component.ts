import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../../core/services/carrito.service';
import { DireccionesService } from '../../../core/services/direccion.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { Direccion } from '../../../core/models/direccion.model';
import { PedidoCreateRequest } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private direccionesService = inject(DireccionesService);
  private pedidoService = inject(PedidoService);
  private notificacionesService = inject(NotificacionesService);
  private router = inject(Router);

  carrito = computed(() => this.carritoService.carrito());
  direcciones = signal<Direccion[]>([]);
  direccionSeleccionada = signal<number | null>(null);
  procesando = signal(false);

  ngOnInit(): void {
    this.cargarDirecciones();
    this.validarCarrito();
  }

  irAGestionDirecciones(): void {
    this.router.navigate(['/mi-perfil'], { queryParams: { seccion: 'direcciones' } });
  }

  private validarCarrito(): void {
    const carritoActual = this.carrito();
    if (!carritoActual || carritoActual.productos.length === 0) {
      this.notificacionesService.notificarAdvertencia('Tu carrito está vacío');
      this.router.navigate(['/carrito']);
    }
  }

  private cargarDirecciones(): void {
    this.direccionesService.getDirecciones().subscribe({
      next: direcciones => {
        this.direcciones.set(direcciones);
        if (direcciones.length > 0 && !this.direccionSeleccionada()) {
          this.direccionSeleccionada.set(direcciones[0].id);
        }
      },
      error: () => {
        this.notificacionesService.notificarError('Error al cargar direcciones');
      }
    });
  }

  seleccionarDireccion(id: number): void {
    this.direccionSeleccionada.set(id);
  }

  confirmarPedido(): void {
    if (!this.direccionSeleccionada()) {
      this.notificacionesService.notificarAdvertencia('Selecciona una dirección de envío');
      return;
    }

    const request: PedidoCreateRequest = {
      direccionId: this.direccionSeleccionada()!
    };

    this.procesando.set(true);

    this.pedidoService.crearPedido(request).subscribe({
      next: (pedido) => {
        this.notificacionesService.notificarExito('¡Pedido realizado con éxito!');
        this.carritoService.resetLocal();
        this.router.navigate(['/mi-perfil'], { queryParams: { seccion: 'pedidos' } });
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        this.procesando.set(false);

        const mensaje = err.error?.message || 'Error al procesar el pedido';
        this.notificacionesService.notificarError(mensaje);
      }
    });
  }

  volverAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }
}

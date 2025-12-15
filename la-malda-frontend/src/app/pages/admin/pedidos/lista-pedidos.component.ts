import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { Pedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss']
})
export class ListaPedidosComponent implements OnInit {
  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  seleccionado = signal<Pedido | null>(null);
  pedidoEditandoEstadoId = signal<number | null>(null);
  estadoEditable = signal<string>('');
  actualizandoEstado = signal(false);
  readonly estadosDisponibles = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'PREPARANDO', label: 'Preparando' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'DEVUELTO', label: 'Devuelto' }
  ];

  constructor(
    private pedidoService: PedidoService,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando.set(true);
    this.pedidoService.obtenerPedidosAdmin().subscribe({
      next: data => {
        this.pedidos.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar los pedidos');
        this.cargando.set(false);
      }
    });
  }

  verDetalle(pedido: Pedido): void {
    this.seleccionado.set(pedido);
    this.estadoEditable.set(pedido.estado);
    this.pedidoEditandoEstadoId.set(null);
  }

  editarEstado(pedido: Pedido): void {
    this.seleccionado.set(pedido);
    this.estadoEditable.set(pedido.estado);
    this.pedidoEditandoEstadoId.set(pedido.id);
  }

  getEstadoTexto(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      DEVUELTO: 'Devuelto'
    };
    return map[estado] || estado;
  }

  getCantidadProd(pedido: Pedido): number {
    return pedido.lineas.reduce((acc, linea) => acc + linea.cantidad, 0);
  }

  estaEditandoEstado(pedido: Pedido | null): boolean {
    if (!pedido) return false;
    return this.pedidoEditandoEstadoId() === pedido.id;
  }

  onEstadoSelectChange(value: string): void {
    this.estadoEditable.set(value);
  }

  actualizarEstadoSeleccionado(): void {
    const pedido = this.seleccionado();
    const estado = this.estadoEditable();
    if (!pedido || !estado || pedido.estado === estado) {
      return;
    }

    this.actualizandoEstado.set(true);
    this.pedidoService.actualizarEstado(pedido.id, estado).subscribe({
      next: actualizado => {
        this.pedidos.update(lista => lista.map(p => (p.id === actualizado.id ? actualizado : p)));
        this.seleccionado.set(actualizado);
        this.estadoEditable.set(actualizado.estado);
        this.pedidoEditandoEstadoId.set(null);
        this.notificacionesService.notificarExito('Estado del pedido actualizado');
        this.actualizandoEstado.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo actualizar el estado');
        this.actualizandoEstado.set(false);
      }
    });
  }

  getClaseEstado(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'estado-badge estado-pendiente',
      CONFIRMADO: 'estado-badge estado-confirmado',
      PREPARANDO: 'estado-badge estado-preparando',
      ENVIADO: 'estado-badge estado-enviado',
      ENTREGADO: 'estado-badge estado-entregado',
      CANCELADO: 'estado-badge estado-cancelado',
      DEVUELTO: 'estado-badge estado-devuelto'
    };
    return map[estado] || 'estado-badge';
  }
}

import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutenticacionService } from '../../../core/services/autenticacion.service';
import { DireccionesService } from '../../../core/services/direccion.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Direccion, DireccionPayload } from '../../../core/models/direccion.model';
import { Pedido } from '../../../core/models/pedido.model';
import { LucideAngularModule } from 'lucide-angular';

type SeccionPerfil = 'datos' | 'pedidos' | 'direcciones';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private authService = inject(AutenticacionService);
  private direccionesService = inject(DireccionesService);
  private pedidoService = inject(PedidoService);
  private notificacionesService = inject(NotificacionesService);
  private route = inject(ActivatedRoute);

  seccionActiva = signal<SeccionPerfil>('datos');
  usuario = signal<Usuario | null>(null);
  direcciones = signal<Direccion[]>([]);
  pedidos = signal<Pedido[]>([]);
  editandoDatos = signal(false);
  direccionPredeterminadaId = signal<number | null>(null);
  formDatos = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    rol: '',
    activo: true
  };

  cargandoDatos = signal(true);
  cargandoPedidos = signal(false);
  cargandoDirecciones = signal(false);

  mostrandoFormularioDireccion = signal(false);
  direccionEditando = signal<Direccion | null>(null);
  direccionForm: DireccionPayload = {
    calle: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: 'España'
  };

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const seccionParam = params.get('seccion');
        if (seccionParam === 'pedidos' || seccionParam === 'direcciones') {
          this.cambiarSeccion(seccionParam);
        } else {
          this.cambiarSeccion('datos');
        }
      });
    this.cargarDatosUsuario();
  }

  cambiarSeccion(seccion: SeccionPerfil): void {
    this.seccionActiva.set(seccion);
    if (seccion === 'pedidos' && this.pedidos().length === 0) {
      this.cargarPedidos();
    }
    if (seccion === 'direcciones' && this.direcciones().length === 0) {
      this.cargarDirecciones();
    }
  }

  private cargarDatosUsuario(): void {
    this.cargandoDatos.set(true);
    this.authService.getPerfil().subscribe({
      next: usuario => {
        this.usuario.set(usuario);
        this.cargandoDatos.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo cargar tu perfil');
        this.cargandoDatos.set(false);
      }
    });
  }

  editarDatos(): void {
    const user = this.usuario();
    if (!user) {
      return;
    }
    this.formDatos = {
      nombre: user.nombre ?? '',
      apellidos: user.apellidos ?? '',
      telefono: user.telefono ?? '',
      email: user.email ?? '',
      rol: user.rol ?? '',
      activo: user.activo ?? true
    };
    this.editandoDatos.set(true);
  }

  cancelarEdicionDatos(): void {
    this.editandoDatos.set(false);
  }

  guardarDatos(): void {
    this.authService.actualizarPerfil(this.formDatos).subscribe({
      next: usuario => {
        this.usuario.set(usuario);
        this.notificacionesService.notificarExito('Datos actualizados');
        this.editandoDatos.set(false);
      },
      error: () => this.notificacionesService.notificarError('No se pudieron guardar tus datos')
    });
  }

  private cargarPedidos(): void {
    this.cargandoPedidos.set(true);
    this.pedidoService.obtenerMisPedidos().subscribe({
      next: pedidos => {
        this.pedidos.set(pedidos);
        this.cargandoPedidos.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar tus pedidos');
        this.cargandoPedidos.set(false);
      }
    });
  }

  private cargarDirecciones(): void {
    this.cargandoDirecciones.set(true);
    this.direccionesService.getDirecciones().subscribe({
      next: direcciones => {
        this.direcciones.set(direcciones);
        this.direccionPredeterminadaId.set(direcciones.length > 0 ? direcciones[0].id : null);
        this.cargandoDirecciones.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar tus direcciones');
        this.cargandoDirecciones.set(false);
      }
    });
  }

  abrirFormularioDireccion(direccion?: Direccion): void {
    if (direccion) {
      this.direccionEditando.set(direccion);
      this.direccionForm = {
        calle: direccion.calle,
        ciudad: direccion.ciudad,
        provincia: direccion.provincia,
        codigoPostal: direccion.codigoPostal,
        pais: direccion.pais
      };
    } else {
      this.direccionEditando.set(null);
      this.direccionForm = {
        calle: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        pais: 'España'
      };
    }
    this.mostrandoFormularioDireccion.set(true);
  }

  cerrarFormularioDireccion(): void {
    this.mostrandoFormularioDireccion.set(false);
  }

  guardarDireccion(): void {
    const form = this.direccionForm;
    const editando = this.direccionEditando();

    const request = editando
      ? this.direccionesService.actualizarDireccion(editando.id, form)
      : this.direccionesService.crearDireccion(form);

    request.subscribe({
      next: () => {
        this.notificacionesService.notificarExito('Dirección guardada');
        this.cargarDirecciones();
        this.cerrarFormularioDireccion();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo guardar la dirección');
      }
    });
  }

  eliminarDireccion(id: number): void {
    if (!confirm('¿Eliminar esta dirección?')) {
      return;
    }
    this.direccionesService.eliminarDireccion(id).subscribe({
      next: () => {
        this.notificacionesService.notificarExito('Dirección eliminada');
        this.cargarDirecciones();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo eliminar la dirección');
      }
    });
  }

  estadoPedidoTexto(estado: string): string {
    const mapa: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      DEVUELTO: 'Devuelto'
    };
    return mapa[estado] || estado;
  }

  getClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      PENDIENTE: 'estado-badge estado-pendiente',
      CONFIRMADO: 'estado-badge estado-confirmado',
      PREPARANDO: 'estado-badge estado-preparando',
      ENVIADO: 'estado-badge estado-enviado',
      ENTREGADO: 'estado-badge estado-entregado',
      CANCELADO: 'estado-badge estado-cancelado',
      DEVUELTO: 'estado-badge estado-devuelto'
    };
    return clases[estado] || 'estado-badge';
  }

  totalLineas(pedido: Pedido): number {
    return pedido.lineas.reduce((total, linea) => total + linea.cantidad, 0);
  }

  esDireccionPredeterminada(id: number): boolean {
    return this.direccionPredeterminadaId() === id;
  }
}

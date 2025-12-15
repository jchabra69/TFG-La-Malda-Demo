import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { Usuario, UsuarioFormulario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.scss']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  mostrandoFormulario = signal(false);
  editandoId = signal<number | null>(null);
  cargando = signal(true);

  form: UsuarioFormulario = {
    email: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    rol: 'CLIENTE',
    password: '',
    activo: true
  };

  constructor(
    private adminService: AdminService,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.adminService.getUsuarios().subscribe({
      next: usuarios => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudieron cargar los usuarios');
        this.cargando.set(false);
      }
    });
  }

  getRolClass(rol: string): string {
    return rol === 'ADMIN' ? 'badge-danger' : 'badge';
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-badge estado-activo' : 'estado-badge estado-inactivo';
  }

  crear(): void {
    this.form = {
      email: '',
      nombre: '',
      apellidos: '',
      telefono: '',
      rol: 'CLIENTE',
      password: '',
      activo: true
    };
    this.editandoId.set(null);
    this.mostrandoFormulario.set(true);
  }

  editar(usuario: Usuario): void {
    this.form = {
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      rol: usuario.rol,
      activo: usuario.activo
    };
    this.editandoId.set(usuario.id);
    this.mostrandoFormulario.set(true);
  }

  guardar(): void {
    const payload: Usuario = {
      id: this.editandoId() ?? 0,
      email: this.form.email,
      nombre: this.form.nombre,
      apellidos: this.form.apellidos,
      telefono: this.form.telefono,
      rol: this.form.rol,
      activo: this.form.activo,
      password: this.form.password
    };

    const operacion = this.editandoId()
      ? this.adminService.actualizarUsuario(this.editandoId()!, payload)
      : this.adminService.crearUsuario(payload);

    operacion.subscribe({
      next: () => {
        this.notificacionesService.notificarExito(
          this.editandoId() ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
        );
        this.cancelar();
        this.cargar();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo guardar el usuario');
      }
    });
  }

  alternarActivo(usuario: Usuario): void {
    this.adminService.alternarActivo(usuario.id).subscribe({
      next: () => {
        this.notificacionesService.notificarExito(
          usuario.activo ? 'Usuario desactivado' : 'Usuario activado'
        );
        this.cargar();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo cambiar el estado del usuario');
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    this.adminService.eliminarUsuario(id).subscribe({
      next: () => {
        this.notificacionesService.notificarExito('Usuario eliminado correctamente');
        this.cargar();
      },
      error: () => {
        this.notificacionesService.notificarError('No se pudo eliminar el usuario');
      }
    });
  }

  cancelar(): void {
    this.mostrandoFormulario.set(false);
    this.editandoId.set(null);
  }
}

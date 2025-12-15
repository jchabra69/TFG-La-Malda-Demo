import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'advertencia';

export interface NotificacionUI {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private contadorNotificaciones = 0;
  readonly notificaciones = signal<NotificacionUI[]>([]);

  notificarExito(mensaje: string) {
    this.agregarNotificacion('exito', mensaje);
  }

  notificarAdvertencia(mensaje: string) {
    this.agregarNotificacion('advertencia', mensaje);
  }

  notificarError(mensaje: string) {
    this.agregarNotificacion('error', mensaje);
  }

  cerrarNotificacion(id: number) {
    this.notificaciones.set(this.notificaciones().filter(n => n.id !== id));
  }

  private agregarNotificacion(tipo: TipoNotificacion, mensaje: string) {
    const id = ++this.contadorNotificaciones;
    this.notificaciones.set([{ id, tipo, mensaje }, ...this.notificaciones()]);
    const timeout = tipo === 'error' ? 7000 : 4500;
    setTimeout(() => this.cerrarNotificacion(id), timeout);
  }
}

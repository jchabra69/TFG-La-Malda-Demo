import { Component } from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { NotificacionesService } from '../../core/services/notificaciones.service';

@Component({
  selector: 'app-banner-notificacion',
  standalone: true,
  imports: [NgForOf, NgClass],
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.scss']
})
export class BannerNotificacionComponent {
  constructor(private notificacionesService: NotificacionesService) {}

  notificaciones() {
    return this.notificacionesService.notificaciones();
  }

  cerrar(id: number) {
    this.notificacionesService.cerrarNotificacion(id);
  }
}

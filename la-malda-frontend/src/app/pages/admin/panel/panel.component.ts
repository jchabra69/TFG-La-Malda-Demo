// src/app/pages/admin/panel/panel.component.ts
// Dashboard del panel de admin: métricas rápidas, logs de auditoría
// y algún acceso directo pa ir a secciones clave.
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { AutenticacionService } from '../../../core/services/autenticacion.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  stats = signal<AdminStats | null>(null);
  cargando = signal(true);
  errorMessage = signal<string | null>(null);
  sidebarOpen = signal(true);
  activeSection = signal('dashboard');

  constructor(
    private adminService: AdminService,
    public authService: AutenticacionService
  ) {}

  ngOnInit() {

    this.cargarStats();
  }

  // Pide las estadísticas principales al backend
  cargarStats() {
    this.cargando.set(true);
    this.errorMessage.set(null);
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error pantallaCarga stats:', err);
        const message = err?.error?.message || err?.message || 'Error inesperado';
        this.errorMessage.set(message);
        this.stats.set(null);
        this.cargando.set(false);
      }
    });
  }



}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AutenticacionService } from '../../../core/services/autenticacion.service';
import { BannerNotificacionComponent } from '../../../global/notificaciones/notificacion.component';

@Component({
  selector: 'app-admin-estructura-general',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, BannerNotificacionComponent],
  template: `
    <div class="admin-layout">

      <header class="admin-header">
        <div class="header-content">
          <div class="header-left">
            <button (click)="activarMenuLateral()" class="menu-btn"
                    [attr.aria-label]="menuLateralAbierto() ? 'Close menu' : 'Open menu'">
              <i [class]="menuLateralAbierto() ? 'fas fa-times' : 'fas fa-bars'"></i>
            </button>
            <h1 class="logo">
              LA MALDA<span class="separator">/</span><span class="admin-text">Admin</span>
            </h1>
          </div>

          <div class="header-right">
            <button routerLink="/" class="home-btn" title="Ir a la tienda">
              <i class="fas fa-home"></i>
            </button>

            <div class="user-info">
              <p class="user-name">{{ authService.usuarioActual()?.nombre }}</p>
              <p class="user-role">{{ authService.usuarioActual()?.rol }}</p>
            </div>

            <button class="user-avatar" title="User profile">
              {{ getInicialesUsuario() }}
            </button>

            <button (click)="logout()" class="logout-btn" title="Cerrar sesión">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <aside class="admin-sidebar" [class.hidden]="!menuLateralAbierto()">
        <nav>
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active" class="nav-item">
            <i class="fas fa-chart-line"></i><span>Panel</span>
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users"></i><span>Usuarios</span>
          </a>
          <a routerLink="/admin/productos" routerLinkActive="active" class="nav-item">
            <i class="fas fa-box"></i><span>Productos</span>
          </a>
          <a routerLink="/admin/pedidos" routerLinkActive="active" class="nav-item">
            <i class="fas fa-shopping-bag"></i><span>Pedidos</span>
          </a>
          <a routerLink="/admin/categorias" routerLinkActive="active" class="nav-item">
            <i class="fas fa-folder"></i><span>Categorías</span>
          </a>
        </nav>
      </aside>

      <main class="admin-main" [class.sidebar-open]="menuLateralAbierto()">
        <app-banner-notificacion></app-banner-notificacion>

        <div class="admin-container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./admin-estructura-general.scss']
})

export class AdminEstructuraGeneralComponent {
  menuLateralAbierto = signal(true);
  constructor(public authService: AutenticacionService) {}

  // Abre/cierra el menú lateral en pantallas pequeñas
  activarMenuLateral() { this.menuLateralAbierto.set(!this.menuLateralAbierto()); }

  getInicialesUsuario(): string {
    const user = this.authService.usuarioActual();
    if (!user?.nombre) return 'A';
    const letra = user.nombre.trim()[0];
    if (!letra) return 'A';
    return letra.toUpperCase();
  }

  logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) this.authService.logout();
  }
}

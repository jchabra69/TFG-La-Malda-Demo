import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { BarraAnunciosComponent } from './global/barra-anuncios/barra-anuncios.component';
import { FooterComponent } from './global/footer/footer-component';
import { NavbarComponent } from './global/navbar/navbar-component';
import { ModalAutenticacionComponent } from './global/modal-autenticacion/modal-autenticacion.component';
import { AutenticacionService } from './core/services/autenticacion.service';
import { ModalService } from './core/services/modal.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BannerNotificacionComponent } from './global/notificaciones/notificacion.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    BarraAnunciosComponent,
    NavbarComponent,
    FooterComponent,
    ModalAutenticacionComponent,
    BannerNotificacionComponent
  ],
  template: `
    <div class="page-loader" *ngIf="estaCargando" aria-live="polite" aria-label="La Malda' Culture se está cargando">
      <div class="loader-minimal">
        <img src="/icons/mlogo.svg" alt="Logotipo de La Malda" aria-hidden="true" class="loader-emblem"/>
        <p class="loader-headline">LA MALDA'</p>
        <p class="loader-subline">Culture loading</p>
        <div class="loader-bar">
          <span></span>
        </div>
      </div>
    </div>
    <app-barra-anuncios *ngIf="!esRutaAdmin"></app-barra-anuncios>
    <app-navbar *ngIf="!esRutaAdmin"></app-navbar>

    <main [class.admin-shell]="esRutaAdmin">
      <router-outlet></router-outlet>
    </main>

    <app-footer *ngIf="!esRutaAdmin"></app-footer>

    <app-modal-autenticacion #authModal/>

    <app-banner-notificacion></app-banner-notificacion>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  titulo = 'La Malda';
  estaCargando = true;
  esRutaAdmin = false;
  private idLiberarCarga: ReturnType<typeof setTimeout> | null = null;
  private idSeguridadCarga: ReturnType<typeof setTimeout> | null = null;
  private routeWatcherSub?: Subscription;

  @ViewChild('authModal') authModal!: ModalAutenticacionComponent;

  constructor(
    public authService: AutenticacionService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.actualizarRutaAdmin(this.router.url);

    this.modalService.abrirAuthModal$.subscribe(payload => this.authModal.open(payload.mode, payload.context));


    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), take(1))
      .subscribe(() => this.liberarPantalla(400));


    this.routeWatcherSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.actualizarRutaAdmin(event.urlAfterRedirects));


    this.idSeguridadCarga = setTimeout(() => this.liberarPantalla(), 4000);
  }

  openAuthModal(mode: 'login' | 'register' = 'login') {
    this.authModal.open(mode);
  }

  ngOnDestroy(): void {
    this.limpiarTiemposPantallaCarga();
    this.routeWatcherSub?.unsubscribe();
  }

  private liberarPantalla(delay = 0) {
    if (!this.estaCargando) return;
    if (this.idLiberarCarga) clearTimeout(this.idLiberarCarga);
    this.idLiberarCarga = setTimeout(() => {
      this.estaCargando = false;
      this.limpiarTiemposPantallaCarga();
    }, delay);
  }

  private limpiarTiemposPantallaCarga() {
    if (this.idLiberarCarga) { clearTimeout(this.idLiberarCarga); this.idLiberarCarga = null; }
    if (this.idSeguridadCarga) { clearTimeout(this.idSeguridadCarga); this.idSeguridadCarga = null; }
  }

  private actualizarRutaAdmin(url: string) {
    this.esRutaAdmin = url?.startsWith('/admin');
    if (typeof document !== 'undefined') {
      document.title = this.esRutaAdmin ? "La Malda' | Panel" : "La Malda' | Inicio";
    }
  }
}

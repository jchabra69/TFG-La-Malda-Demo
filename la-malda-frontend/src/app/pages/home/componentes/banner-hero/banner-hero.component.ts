import {
  Component, signal, computed, ViewChildren, ElementRef, QueryList, AfterViewInit, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface DiapositivaImagen {
  tipo: 'imagen';
  src: string;
  alt: string;
  slug: string;
  descripcion?: string;
  duracion?: number; // ms
}

interface DiapositivaVideo {
  tipo: 'video';
  src: string;
  poster?: string;
  slug: string;
  descripcion?: string;
  duracion: number;
}

type Diapositiva = DiapositivaImagen | DiapositivaVideo;

@Component({
  selector: 'app-banner-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './banner-hero.component.html',
  styleUrls: ['./banner-hero.component.scss'],
})
export class BannerHeroComponent implements OnInit, AfterViewInit, OnDestroy {
  reproduccionAutomatica = true;
  duracionImagen = 6500;
  duracionVideo = 25000;
  movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  @ViewChildren('videoEl') videos!: QueryList<ElementRef<HTMLVideoElement>>;

  actual = signal(0);
  progreso = signal(0);
  cargando = signal(true);
  diapositivas: Diapositiva[] = [];
  estaSilenciado = signal(true);

  private animacionFrame?: number;
  private tiempoInicio = 0;
  private duracionActual = this.duracionImagen;
  private vistaLista = false;

  etiquetaDiapositiva = computed(() =>
    `Diapositiva ${this.actual() + 1} de ${this.diapositivas.length}`
  );

  ngOnInit() {
    this.diapositivas = this.diapositivasPorDefecto();
    this.cargando.set(false);
    setTimeout(() => {
      if (this.reproduccionAutomatica && !this.movimientoReducido) {
        this.iniciarProgreso();
      }
    }, 100);

    document.addEventListener('visibilitychange', this.manejarVisibilidad);
  }

  ngAfterViewInit() {
    this.vistaLista = true;
  }

  ngOnDestroy() {
    if (this.animacionFrame) {
      cancelAnimationFrame(this.animacionFrame);
    }
    document.removeEventListener('visibilitychange', this.manejarVisibilidad);
  }

  private diapositivasPorDefecto(): Diapositiva[] {
    return [
      {
        tipo: 'imagen',
        slug: 'bikinis',
        src: 'assets/imgs/banner-inicio/Bikinis-LaMalda.webp',
        alt: 'Bikinis La Malda Culture 2025',
        descripcion: 'Nueva colección de bikinis',
        duracion: this.duracionImagen
      },
      {
        tipo: 'imagen',
        slug: 'revenant',
        src: 'assets/imgs/banner-inicio/test.webp',
        alt: 'Revenant – cápsula oscura',
        descripcion: 'Revenant',
        duracion: this.duracionImagen
      },

      /*
      *
      * {
        tipo: 'imagen',
        slug: 'revenant',
        src: 'assets/imgs/banner-inicio/Revenant-LaMalda.webp',
        alt: 'Revenant – cápsula oscura',
        descripcion: 'Revenant',
        duracion: this.duracionImagen
      },
      *
      *
      * */

      {
        tipo: 'video',
        slug: 'i-love-fake',
        src: 'assets/videos/ILOVEFAKE-LaMalda.mp4',
        poster: 'assets/imgs/banner-inicio/Bikinis-LaMalda.webp',
        descripcion: 'I LOVE FAKE – Piezas con actitud',
        duracion: this.duracionVideo
      }
    ];
  }

  private manejarVisibilidad = () => {
    if (document.hidden) {
      this.videos?.forEach(v => v.nativeElement.pause());
      if (this.animacionFrame) {
        cancelAnimationFrame(this.animacionFrame);
      }
    } else if (this.reproduccionAutomatica && !this.movimientoReducido) {
      this.iniciarProgreso();
    }
  };

  private iniciarProgreso() {
    if (!this.vistaLista || !this.diapositivas.length) return;
    if (this.animacionFrame) {
      cancelAnimationFrame(this.animacionFrame);
    }

    const diapositiva = this.diapositivas[this.actual()];
    if (!diapositiva) return;

    this.videos?.forEach(v => {
      v.nativeElement.pause();
      v.nativeElement.currentTime = 0;
    });

    if (diapositiva.tipo === 'imagen') {
      this.duracionActual = diapositiva.duracion ?? this.duracionImagen;
      this.tiempoInicio = performance.now();

      const actualizar = (ahora: number) => {
        const progreso = Math.min(1, (ahora - this.tiempoInicio) / this.duracionActual);
        this.progreso.set(progreso);

        if (progreso >= 1) {
          this.siguiente();
        } else {
          this.animacionFrame = requestAnimationFrame(actualizar);
        }
      };

      this.animacionFrame = requestAnimationFrame(actualizar);
    } else {
      // Video
      const video = this.reproducirVideoActivo();
      if (!video) return;

      this.progreso.set(0);

      const actualizar = () => {
        const duracion = video!.duration || 0;
        const tiempoActual = video!.currentTime || 0;
        const progreso = duracion > 0 ? Math.min(1, tiempoActual / duracion) : 0;

        this.progreso.set(progreso);

        if (video!.ended || (duracion > 0 && tiempoActual >= duracion - 0.05)) {
          this.siguiente();
        } else {
          this.animacionFrame = requestAnimationFrame(actualizar);
        }
      };

      this.animacionFrame = requestAnimationFrame(actualizar);
    }
  }

  private getVideoActivo(): HTMLVideoElement | undefined {
    const indice = this.actual();
    let video: HTMLVideoElement | undefined;

    this.videos?.forEach(ref => {
      const elemento = ref.nativeElement;
      if (elemento.getAttribute('data-index') === String(indice)) {
        video = elemento;
      }
    });

    return video;
  }

  private reproducirVideoActivo() {
    const video = this.getVideoActivo();
    if (!video) return undefined;

    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.currentTime = 0;
    video.loop = false;

    const intentarReproducir = () => {
      video.play().catch(_err => {
        const alPoderReproducir = () => {
          video.removeEventListener('canplay', alPoderReproducir);
          video.play().catch(e => console.warn('Vídeo bloqueado en autoplay:', e));
        };
        video.addEventListener('canplay', alPoderReproducir, { once: true });
      });
    };

    intentarReproducir();
    return video;
  }

  onErrorVideo(evento: Event) {
    console.error('Error cargando video:', evento);
    setTimeout(() => {
      if (this.reproduccionAutomatica && !this.movimientoReducido) {
        this.siguiente();
      }
    }, 1000);
  }

  irA(indice: number) {
    const siguienteIndice = (indice + this.diapositivas.length) % this.diapositivas.length;
    if (siguienteIndice === this.actual()) return;

    if (this.animacionFrame) {
      cancelAnimationFrame(this.animacionFrame);
    }

    this.videos?.forEach(v => {
      const video = v.nativeElement;
      video.pause();
      video.currentTime = 0;
    });

    this.actual.set(siguienteIndice);
    this.progreso.set(0);

    if (this.reproduccionAutomatica && !this.movimientoReducido) {
      this.iniciarProgreso();
    }
  }

  siguiente() {
    this.irA(this.actual() + 1);
  }

  anterior() {
    this.irA(this.actual() - 1);
  }

  alternarSilencio() {
    const video = this.getVideoActivo();
    if (!video) return;

    const nuevoEstado = !this.estaSilenciado();
    this.estaSilenciado.set(nuevoEstado);
    video.muted = nuevoEstado;
    video.volume = nuevoEstado ? 0 : 1;

    if (!nuevoEstado) {
      try {
        video.play();
      } catch {

      }
    }
  }
}

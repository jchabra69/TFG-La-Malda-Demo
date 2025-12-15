import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-modal-autenticacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './modal-autenticacion.component.html',
  styleUrls: ['./modal-autenticacion.component.scss'],

  animations: [

    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),

    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' })
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' })
        )
      ])
    ])
  ]
})
export class ModalAutenticacionComponent {

  estaAbierto = signal(false);
  modo = signal<'login' | 'register'>('login');
  cargando = signal(false);
  mensajeError = signal<string | null>(null);
  mostrarContrasena = signal(false);
  contexto = signal<string | null>(null);

  cierre = output<void>();

  formularioAcceso: FormGroup;
  formularioRegistro: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService
  ) {
    // Formulario de login
    this.formularioAcceso = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Formulario de registro
    this.formularioRegistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      apellidos: ['', [Validators.required, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{7,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Abre el modal en login o registro
  open(mode: 'login' | 'register' = 'login', context: string | null = null): void {
    this.modo.set(mode);
    this.estaAbierto.set(true);
    this.mensajeError.set(null);
    this.contexto.set(context);
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
  }

  close(): void {
    this.estaAbierto.set(false);
    this.mensajeError.set(null);
    this.formularioAcceso.reset();
    this.formularioRegistro.reset();
    document.body.style.overflow = '';
    this.cierre.emit();
  }

  cambiarModo(): void {
    this.modo.update(m => m === 'login' ? 'register' : 'login');
    this.mensajeError.set(null);
  }

  alternarVisibilidadContrasena(): void {
    this.mostrarContrasena.update(v => !v);
  }

  enviarLogin(): void {
    if (this.formularioAcceso.invalid) {
      this.formularioAcceso.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    this.authService.login(this.formularioAcceso.value).subscribe({
      next: () => {
        this.cargando.set(false);
        this.close();

        //Redirige al usuario a la url donde estbaa
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          window.location.href = redirectUrl;
        }
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(
          this.traducirErrorHttp(error, 'Correo o contraseña incorrectos')
        );
      }
    });
  }

  enviarRegistro(): void {
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    this.authService.registro({
      nombre: this.formularioRegistro.value.nombre,
      apellidos: this.formularioRegistro.value.apellidos,
      telefono: this.formularioRegistro.value.telefono,
      email: this.formularioRegistro.value.email,
      password: this.formularioRegistro.value.password
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.close();
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(
          this.traducirErrorHttp(error, 'No se pudo completar el registro. Inténtalo de nuevo.')
        );
      }
    });
  }

  getMensajeError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Formato de correo no válido';
    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) return 'Formato no válido';

    return 'Campo no válido';
  }
  private traducirErrorHttp(error: any, porDefecto: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
      }
      const mensajeBackend = (error.error as any)?.message || (error.error as any)?.mensaje;
      if (mensajeBackend) return mensajeBackend;
    }

    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('failed to fetch')) {
      return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
    }

    return porDefecto;
  }
}

// Servicio muy simple pa abrir el modal de login/registro
// desde cualquier parte de la app sin acoplar componentes entre sí.
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AuthModalPayload {
  mode: 'login' | 'register';
  context?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private openAuthModalSubject = new Subject<AuthModalPayload>();

  abrirAuthModal$ = this.openAuthModalSubject.asObservable();

  abrirLogin(context?: string) {
    this.openAuthModalSubject.next({ mode: 'login', context });
  }

}

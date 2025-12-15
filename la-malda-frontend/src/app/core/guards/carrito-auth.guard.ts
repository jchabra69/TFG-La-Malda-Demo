import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { ModalService } from '../services/modal.service';

export const carritoAuthGuard: CanActivateFn = () => {

  const authService = inject(AutenticacionService);
  const modalService = inject(ModalService);
  const router = inject(Router);

  //Necesito un guard de carrito pq los usuarios no registrados deben iniciar sesión para continuar por el checkout
  if (authService.estaAutenticado()) {
    return true;
  }

  //Usaré el localStorage como puente para pasar los datos del carrito que tenemos en local a la sesión del usuario ya registrado :D
  localStorage.setItem('redirectUrl', '/carrito');

  modalService.abrirLogin('carrito');

  router.navigate(['/']);

  return false;
};

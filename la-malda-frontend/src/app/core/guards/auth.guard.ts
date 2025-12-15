// Guardia de autenticación para controlar quién puede acceder a ciertas rutas.
// Aquí usamos el servicio de autenticación y redirigimos según corresponda.

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

// Guard para usuarios autenticados
export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AutenticacionService);

  const router = inject(Router);

  if (authService.comprobarCredenciales()) {
    return true;
  }

  localStorage.setItem('redirectUrl', state.url);

  router.navigate(['/']);

  return false;

};


//Esti solo se activará cuando el usuario tenga el rol de Admin
export const adminGuard: CanActivateFn = (route, state) => {

  const authService = inject(AutenticacionService);

  const router = inject(Router);

  if (authService.comprobarCredenciales() && authService.esAdmin()) {

    return true;

  }

  router.navigate(['/']);

  return false;
};

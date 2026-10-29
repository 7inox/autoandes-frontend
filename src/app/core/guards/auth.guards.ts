import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
export const authGuard: CanActivateFn = (_, state) => {
  const a = inject(AuthService);
  return a.autenticado() && a.token()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
export const invitadoGuard: CanActivateFn = () =>
  inject(AuthService).autenticado() ? inject(Router).createUrlTree(['/servicios']) : true;
export const permisoGuard: CanActivateFn = (route) =>
  inject(AuthService).tiene(route.data['permiso'])
    ? true
    : inject(Router).createUrlTree(['/acceso-denegado']);

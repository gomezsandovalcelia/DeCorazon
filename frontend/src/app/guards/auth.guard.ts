import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot  } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn) {
      this.router.navigateByUrl('/login');
      return false;
    }
    
    // Verificar si la ruta tiene roles requeridos
    if (route.data['roles'] && route.data['roles'].length) {
      // Verificar si el usuario tiene el rol requerido
      if (!route.data['roles'].includes(this.authService.userRole)) {
        // Redirigir según el rol
        if (this.authService.userRole === 'MEDICO') {
          this.router.navigateByUrl('/medico/dashboard');
        } else if (this.authService.userRole === 'PACIENTE') {
          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('/login');
        }
        return false;
      }
    }
    
    return true;
  }
}

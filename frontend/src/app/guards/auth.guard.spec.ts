import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: jasmine.SpyObj<Router>;
  let sesion: { isLoggedIn: boolean; userRole: string };

  const ruta = (roles?: string[]) => ({ data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot);
  const estado = {} as RouterStateSnapshot;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    sesion = { isLoggedIn: true, userRole: 'PACIENTE' };
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: sesion }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('redirige al login si no hay sesión', () => {
    sesion.isLoggedIn = false;
    expect(guard.canActivate(ruta(['PACIENTE']), estado)).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('deja pasar si el rol coincide', () => {
    expect(guard.canActivate(ruta(['PACIENTE']), estado)).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('manda al médico a su dashboard si entra en una ruta de paciente', () => {
    sesion.userRole = 'MEDICO';
    expect(guard.canActivate(ruta(['PACIENTE']), estado)).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/medico/dashboard');
  });

  it('manda al paciente a su home si entra en una ruta de médico', () => {
    expect(guard.canActivate(ruta(['MEDICO']), estado)).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('deja pasar en rutas sin roles si hay sesión', () => {
    expect(guard.canActivate(ruta(), estado)).toBeTrue();
  });
});

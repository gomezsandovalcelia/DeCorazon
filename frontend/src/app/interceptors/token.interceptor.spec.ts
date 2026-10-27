import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { TokenInterceptor } from './token.interceptor';

describe('TokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['logout']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: AuthService, useValue: authService }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'mi-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('añade x-token a las peticiones a la API', () => {
    http.get(`${environment.apiUrl}/paciente/1`).subscribe();
    const peticion = httpMock.expectOne(`${environment.apiUrl}/paciente/1`);
    expect(peticion.request.headers.get('x-token')).toBe('mi-token');
    peticion.flush({ ok: true });
  });

  it('no añade el token a otras URLs', () => {
    http.get('https://otra-web.es/datos').subscribe();
    const peticion = httpMock.expectOne('https://otra-web.es/datos');
    expect(peticion.request.headers.has('x-token')).toBeFalse();
    peticion.flush({});
  });

  it('cierra la sesión si la API responde 401', () => {
    http.get(`${environment.apiUrl}/paciente/1`).subscribe({ error: () => {} });
    httpMock.expectOne(`${environment.apiUrl}/paciente/1`)
      .flush({ ok: false }, { status: 401, statusText: 'Unauthorized' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('no cierra la sesión con otros errores', () => {
    http.get(`${environment.apiUrl}/paciente/1`).subscribe({ error: () => {} });
    httpMock.expectOne(`${environment.apiUrl}/paciente/1`)
      .flush({ ok: false }, { status: 403, statusText: 'Forbidden' });
    expect(authService.logout).not.toHaveBeenCalled();
  });
});

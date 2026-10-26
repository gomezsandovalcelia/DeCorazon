import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

// Añade el token x-token a todas las peticiones a la API y
// cierra la sesión si el backend responde que el token no es válido (401)
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  // Se usa Injector para evitar la dependencia circular HttpClient -> interceptor -> AuthService -> HttpClient
  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');
    const peticion = token ? req.clone({ setHeaders: { 'x-token': token } }) : req;

    return next.handle(peticion).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          this.injector.get(AuthService).logout();
        }
        return throwError(() => error);
      })
    );
  }
}

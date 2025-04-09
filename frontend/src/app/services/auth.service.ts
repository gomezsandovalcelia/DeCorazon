import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { loginForm } from '../interfaces/login-form.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor( private http: HttpClient,
    private router: Router) { }

  // En auth.service.ts
login(formData: loginForm): Observable<any> {
  console.log('se ha hecho login:', formData);
  return this.http.post('http://localhost:3000/api/login', formData)
    .pipe(
      tap((res: any) => {
        console.log('Respuesta completa del servidor:', res);
        // Resto del código...
      }),
      catchError(error => {
        console.error('Error completo en login:', error);
        if (error.error) {
          console.error('Mensaje de error del servidor:', error.error.msg);
        }
        return throwError(error);
      })
    );
}
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('tipo');
    localStorage.removeItem('pacienteId');
    localStorage.removeItem('showForm');
    localStorage.removeItem('preguntadeldia');
    this.router.navigateByUrl('/login');
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get userRole(): string {
    return localStorage.getItem('rol') || '';
  }

  get userType(): string {
    return localStorage.getItem('tipo') || '';
  }

  get userId(): string {
    return localStorage.getItem('userId') || '';
  }

  redirectBasedOnRole() {
    const role = this.userRole;
    const type = this.userType;
    
    if (role === 'MEDICO') {
      this.router.navigateByUrl('/medico/dashboard');
    } else if (role === 'PACIENTE') {
      this.router.navigateByUrl('/home');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}

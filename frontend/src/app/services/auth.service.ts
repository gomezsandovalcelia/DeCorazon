import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { loginForm } from '../interfaces/login-form.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor( private http: HttpClient,
    private router: Router) { }

  login(formData: loginForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, formData);
  }

  // Único punto donde se borra la sesión guardada en localStorage
  logout() {
    ['token', 'userId', 'rol', 'tipo', 'pacienteId', 'ultimaMedicion']
      .forEach(clave => localStorage.removeItem(clave));
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

    if (role === 'MEDICO') {
      this.router.navigateByUrl('/medico/dashboard');
    } else if (role === 'PACIENTE') {
      this.router.navigateByUrl('/home');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}

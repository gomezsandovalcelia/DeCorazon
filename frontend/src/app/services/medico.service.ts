// En medico.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = 'http://localhost:3000/api';
  private httpOptions: any;

  constructor(private http: HttpClient) { }

  private getHeader() {
    this.httpOptions = {
      headers: this.addToken(),
    };
  }

  private getToken() {
    let token;
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }
    return token;
  }

  private addToken(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-token': `${token}`,
    });
  }

  // Método para obtener los pacientes asignados a un médico
  getPacientesAsignados(medicoId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/medico/${medicoId}/pacientes`, this.httpOptions);
  }

  getMedicoPorId(medicoId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/medico/${medicoId}`, this.httpOptions);
  }
}
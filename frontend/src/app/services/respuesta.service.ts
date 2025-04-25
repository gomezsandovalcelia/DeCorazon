import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespuestaService {
  private apiUrl = 'http://localhost:3000/api/respuesta';
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

  getAlertas(): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/alertas`, this.httpOptions);
  }

  verificarAlertasPaciente(pacienteId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}/tiene-alertas`, this.httpOptions);
  }

  obtenerRespuestasPaciente(pacienteId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}`, this.httpOptions);
  }
}
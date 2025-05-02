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

  getRespuestas(): Observable<any> {
    this.getHeader();
    return this.http.get(this.apiUrl);
  } 
  
  getRespuestasPaciente(pacienteId: string): Observable<any> {
    this.getHeader();
    return this.http.get(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  getAlertas(): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/alertas`, this.httpOptions);
  }

  actualizarAlerta(respuestaId: string, alerta: boolean): Observable<any> {
    this.getHeader();
    return this.http.put(`${this.apiUrl}/${respuestaId}/alerta`, { alerta });
  }

  verificarAlertasPaciente(pacienteId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}/tiene-alertas`, this.httpOptions);
  }

  obtenerRespuestasPaciente(pacienteId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}`, this.httpOptions);
  }

  guardarRespuesta(pacienteId: string, questionId: string, answer: string): Observable<any> {
    this.getHeader();
    const data = { pacienteId, questionId, answer };
    return this.http.post(`${this.apiUrl}/save-response`, data);
  }
}
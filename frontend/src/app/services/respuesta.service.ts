import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// El token se añade en TokenInterceptor
@Injectable({
  providedIn: 'root'
})
export class RespuestaService {
  private apiUrl = `${environment.apiUrl}/respuesta`;

  constructor(private http: HttpClient) { }

  getRespuestas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getAlertas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alertas`);
  }

  actualizarAlerta(respuestaId: string, alerta: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${respuestaId}/alerta`, { alerta });
  }

  verificarAlertasPaciente(pacienteId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}/tiene-alertas`);
  }

  obtenerRespuestasPaciente(pacienteId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}`);
  }
}

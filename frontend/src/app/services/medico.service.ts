// En medico.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// El token se añade en TokenInterceptor
@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para obtener los pacientes asignados a un médico
  getPacientesAsignados(medicoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medico/${medicoId}/pacientes`);
  }

  getMedicoPorId(medicoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medico/${medicoId}`);
  }

  // Registro público: solo se registran médicos
  registrarMedico(datos: { nombre: string; apellidos: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/medico`, datos);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { measureForm } from '../interfaces/measurements-form.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NuevoPaciente } from '../interfaces/paciente.interface';

// El token se añade en TokenInterceptor
@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPacientePorId(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}`);
  }

  // El médico da de alta a un paciente, que queda asignado a él
  crearPaciente(datos: NuevoPaciente): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/paciente`, datos);
  }

  cambiarPassword(patientId: string, actual: string, nueva: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/paciente/${patientId}/password`, { actual, nueva });
  }

  getMeasurements(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/measurements`);
  }

  getTreatments(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/treatments`);
  }

  getExercise(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/exercise_routines`);
  }

  updateExerciseCheckpoint(patientId: string, exerciseId: string, checkpoint: boolean) {
    return this.http.put(`${this.apiUrl}/paciente/${patientId}/exercise_routines/${exerciseId}`, { checkpoint });
  }

  updateNewMeasurements(patientId: string, formData: measureForm): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/paciente/${patientId}/measurements`, formData);
  }

  agregarTratamiento(pacienteId: string, tratamiento: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/paciente/${pacienteId}/tratamiento`, tratamiento);
  }

  agregarEjercicio(pacienteId: string, ejercicio: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/paciente/${pacienteId}/ejercicio`, ejercicio);
  }

  updateDayMedication(patientId: string, day: string, medication: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/paciente/${patientId}/pastillero/${day}`, medication)
      .pipe(
        catchError(error => {
          console.error('Error actualizando medicación:', error);
          return throwError(() => error);
        })
      );
  }

  getPastillero(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/pastillero`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo pastillero:', error);
          return throwError(() => error);
        })
      );
  }

}

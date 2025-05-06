import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { measureForm } from '../interfaces/measurements-form.interface';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:3000/api';
  private httpOptions: any;

  constructor(private http: HttpClient, private router: Router) { }
  private getHeader(){
    this.httpOptions = {
      headers: this.addToken(),
    };
  }
  private getToken(){
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
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('pacienteId');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('tipo');
    localStorage.removeItem('showForm');
    localStorage.removeItem('preguntadeldia');
    localStorage.removeItem('answeredToday');
    this.router.navigateByUrl('/login');
  }

  getPacientePorId(patientId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}`, this.httpOptions);
  }

  getMeasurements(patientId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/measurements`, this.httpOptions);
  }

  getTreatments(patientId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/treatments`, this.httpOptions);
  }

  getExercise(patientId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/exercise_routines`, this.httpOptions);
  }

  updateExerciseCheckpoint(patientId: string, exerciseId: string, checkpoint: boolean) {
    this.getHeader();
    return this.http.put(`${this.apiUrl}/paciente/${patientId}/exercise_routines/${exerciseId}`, { checkpoint }, this.httpOptions);
  }

  updateNewMeasurements(patientId: string, formData: measureForm): Observable<any> {
    this.getHeader();
    return this.http.put<any>(`${this.apiUrl}/paciente/${patientId}/measurements`, formData, this.httpOptions);
  }

  addRestExercise(pacienteId: string): Observable<any> {

    const now = new Date();
    const restExercise = {
      _id: Date.now().toString(), // ID único
      date: now.toISOString(),
      description: "Ejercicio de reposo: Descansar durante 30 minutos en un ambiente tranquilo",
      checkpoint: false
    };

    return this.http.post(`${this.apiUrl}/paciente/${pacienteId}/exercise`, restExercise)
      .pipe(
        catchError(error => {
          console.error('Error en addRestExercise:', error);
          return throwError(error);
        })
      );
  }

  agregarTratamiento(pacienteId: string, tratamiento: any): Observable<any> {
    this.getHeader();
    return this.http.post<any>(`${this.apiUrl}/paciente/${pacienteId}/tratamiento`, tratamiento, this.httpOptions);
  }

  agregarEjercicio(pacienteId: string, ejercicio: any): Observable<any> {
    this.getHeader();
    return this.http.post<any>(`${this.apiUrl}/paciente/${pacienteId}/ejercicio`, ejercicio, this.httpOptions);
  }

  updateDayMedication(patientId: string, day: string, medication: any): Observable<any> {
    this.getHeader();
    return this.http.put<any>(`${this.apiUrl}/paciente/${patientId}/pastillero/${day}`, medication, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error actualizando medicación:', error);
          return throwError(error);
        })
      );
  }

  getPastillero(patientId: string): Observable<any> {
    this.getHeader();
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/pastillero`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo pastillero:', error);
          return throwError(error);
        })
      );
  }

  getPastilleroToday(patientId: string): Observable<any> {
    this.getHeader();
    const today = new Date();
    let day = today.getDay(); // 0 es domingo, 1 es lunes, etc.
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaActual = diasSemana[day];
    
    return this.http.get<any>(`${this.apiUrl}/paciente/${patientId}/pastillero/${diaActual}`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo pastillero del día:', error);
          return throwError(error);
        })
      );
  }

}

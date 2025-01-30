import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { measureForm } from '../interfaces/measurements-form.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:3000/api';
  private httpOptions: any;

  constructor(private http: HttpClient) { }
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
}

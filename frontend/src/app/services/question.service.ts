import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api/pregunta'; // Asegúrate de poner la URL correcta de tu backend

  constructor(private http: HttpClient) {}

  // Obtener la primera pregunta del cuestionario
  getFirstQuestion(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/first-question/${patientId}`);
  }
  // Obtener la siguiente pregunta basada en la respuesta actual
  getNextQuestion(patientId: string, currentQuestionId: string, answer: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/next-question/${patientId}/${currentQuestionId}/${answer}`);
  }


  // Obtener la pregunta del día
  /*getQuestionOfTheDay(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/preguntadeldia/${patientId}`);
  }*/

  // Guardar la respuesta del usuario
  saveResponse(patientId: string, questionId: string, answer: string): Observable<any> {
    // Verifica los datos antes de enviarlos
    const data = { patientId, questionId, answer };
    console.log('Enviando datos al servidor:', data);

    return this.http.post(`${this.apiUrl}/save-response`, data, {
      headers: { 'Content-Type': 'application/json' } // Especifica el tipo de contenido
    });
  }
  // Nuevo método para enviar alerta al sanitario
  sendAlert(patientId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-alert`, { patientId, reason }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Finalizar el cuestionario
  finishQuestionnaire(patientId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/finish-questionnaire`, { patientId }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

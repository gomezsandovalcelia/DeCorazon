import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api/pregunta';

  constructor(private http: HttpClient) {}

  // Obtener la primera pregunta del cuestionario
  getFirstQuestion(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/first-question/${patientId}`);
  }

 // En question.service.ts
  getNextQuestion(pacienteId: string, currentQuestionId: string, answer: string): Observable<any> {
    console.log('Solicitando siguiente pregunta:', { pacienteId, currentQuestionId, answer });
    return this.http.get(`${this.apiUrl}/next-question/${pacienteId}/${currentQuestionId}/${answer}`);
  }

  // Guardar la respuesta del usuario
  saveResponse(pacienteId: string, questionId: string, answer: string): Observable<any> {
    const data = { pacienteId, questionId, answer };
    console.log('Enviando datos al servidor:', data);
    
    return this.http.post(`${this.apiUrl}/save-response`, data, { 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Método para enviar alerta al sanitario
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

  // Método para obtener todas las preguntas
  getAllQuestions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-questions`);
  }

  // Método para obtener una pregunta por su ID
  getQuestionById(questionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/question/${questionId}`);
  }
}
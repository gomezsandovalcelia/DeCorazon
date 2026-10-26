import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// El token se añade en TokenInterceptor
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/pregunta`;

  constructor(private http: HttpClient) {}

  // Obtener la primera pregunta del cuestionario
  getFirstQuestion(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/first-question/${patientId}`);
  }

  getNextQuestion(pacienteId: string, currentQuestionId: string, answer: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/next-question/${pacienteId}/${currentQuestionId}/${encodeURIComponent(answer)}`);
  }

  // Guardar la respuesta del usuario
  saveResponse(pacienteId: string, questionId: string, answer: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-response`, { pacienteId, questionId, answer });
  }

  // Método para enviar alerta al sanitario
  sendAlert(patientId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-alert`, { patientId, reason });
  }

  // Finalizar el cuestionario
  finishQuestionnaire(patientId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/finish-questionnaire`, { patientId });
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

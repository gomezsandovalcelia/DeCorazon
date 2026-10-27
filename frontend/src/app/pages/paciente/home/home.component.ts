import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';
import { QuestionService } from 'src/app/services/question.service';
import { ToastController } from '@ionic/angular';
import { VALIDADORES_MEDIDAS } from 'src/app/interfaces/measurements-form.interface';

// Horas que deben pasar entre dos registros de medidas
const HORAS_ENTRE_MEDICIONES = 12;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  treatments: any[] = [];
  exercise: any[] = [];
  pacienteId: any;
  pastilleroHoy: any = null; 
  diaActual: string = '';

  currentQuestion: any = null;
  showQuestionnaire: boolean = true;
  questionsHistory: Array<{questionId: string, answer: string}> = [];
  isLastQuestion: boolean = false;

  selectedAnswer: string = '';
  isProcessing: boolean = false;

  public measureForm = this.fb.group({
    weight: ['', VALIDADORES_MEDIDAS.weight],
    heart_rate: ['', VALIDADORES_MEDIDAS.heart_rate],
    blood_pressure: ['', VALIDADORES_MEDIDAS.blood_pressure]
  });

  showWeight = true;
  showHeartRate = false;
  showBloodPressure = false;
  showFormAux = false;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private questionService: QuestionService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const pacienteId = localStorage.getItem('pacienteId');
    this.pacienteId = pacienteId;
    if (pacienteId) {
      this.obtenerDiaActual();
      this.getTreatments(pacienteId);
      this.getExercises(pacienteId);
      this.getPastilleroToday(pacienteId);
      this.loadFirstQuestion();
    } else {
      console.error('No se encontró ID de paciente');
    }
    this.showFormAux = this.puedeRegistrarMedidas();
  }

  // El formulario de medidas se muestra si han pasado HORAS_ENTRE_MEDICIONES desde la última
  private puedeRegistrarMedidas(): boolean {
    const ultimaMedicion = Number(localStorage.getItem('ultimaMedicion'));
    return !ultimaMedicion || Date.now() - ultimaMedicion >= HORAS_ENTRE_MEDICIONES * 60 * 60 * 1000;
  }

  // El backend indica si el paciente ya completó hoy el cuestionario
  loadFirstQuestion() {
    this.questionService.getFirstQuestion(this.pacienteId).subscribe(
      (res) => {
        if (res.ok && !res.completadoHoy) {
          this.showQuestionnaire = true;
          this.currentQuestion = res.question;
          this.questionsHistory = [];
          this.isLastQuestion = false;
          this.selectedAnswer = '';
        } else {
          this.showQuestionnaire = false;
        }
      },
      (error) => console.error("Error obteniendo la primera pregunta:", error)
    );
  }

  async submitAnswer() {
    if (!this.selectedAnswer || !this.currentQuestion || this.isProcessing) {
      return;
    }
  
    this.isProcessing = true;
  
    try {
      // Guardar la respuesta actual
      const response = await this.questionService.saveResponse(
        this.pacienteId, 
        this.currentQuestion._id, 
        this.selectedAnswer
      ).toPromise();
  
  
      if (response.ok) {
        // Guardar en historial
        this.questionsHistory.push({
          questionId: this.currentQuestion._id,
          answer: this.selectedAnswer
        });
  
        // Verificar si la respuesta requiere alerta
        if (response.requiresAlert) {
          await this.sendAlert(response.alertReason);
        }
  
        // Verificar si debemos finalizar según la configuración de la pregunta actual
        const currentQuestionConfig = this.currentQuestion.nextQuestions[this.selectedAnswer];
        
        if (currentQuestionConfig && currentQuestionConfig.endQuestionnaire) {
          await this.finishQuestionnaire();
          return;
        }
  
        // Cargar la siguiente pregunta
        const nextResponse = await this.questionService.getNextQuestion(
          this.pacienteId,
          this.currentQuestion._id,
          this.selectedAnswer
        ).toPromise();
  
  
        if (nextResponse.ok && nextResponse.question) {
          this.currentQuestion = nextResponse.question;
          this.selectedAnswer = '';
          this.isLastQuestion = nextResponse.isLastQuestion;
        } else {
          // Si no hay más preguntas, finalizar el cuestionario
          await this.finishQuestionnaire();
        }
      } else {
        this.showNotification('Error al procesar la respuesta: ' + response.msg);
      }
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
      this.showNotification('Ocurrió un error al procesar tu respuesta.');
    } finally {
      this.isProcessing = false;
    }
  }

  async sendAlert(reason: string) {
    try {
      const result = await this.questionService.sendAlert(this.pacienteId, reason).toPromise();
      
      if (result.ok) {
        // Mostrar notificación al usuario
        this.showNotification(
          'Notificación enviada al personal sanitario. Gracias por reportar tu estado.'
        );
      }
    } catch (error) {
      console.error('Error al enviar alerta:', error);
    }
  }

  async finishQuestionnaire() {
    try {
      await this.questionService.finishQuestionnaire(this.pacienteId).toPromise();
      
      this.showQuestionnaire = false;
      this.currentQuestion = null;
      
      this.showNotification('Has completado el cuestionario diario. ¡Gracias!');
    } catch (error) {
      console.error('Error al finalizar cuestionario:', error);
    }
  }

  async showNotification(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'middle',
      color: 'primary',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  submitWeight() {
    if (this.measureForm.get('weight')?.valid) {
      this.showWeight = false;
      this.showHeartRate = true;
    } else {
      this.showNotification('El peso debe estar entre 20 y 300 kg.');
    }
  }

  submitHeartRate() {
    if (this.measureForm.get('heart_rate')?.valid) {
      this.showHeartRate = false;
      this.showBloodPressure = true;
    } else {
      this.showNotification('La frecuencia cardiaca debe estar entre 30 y 250 ppm.');
    }
  }
  
  private getTreatments(pacienteId: string): void {
    this.pacienteService.getTreatments(pacienteId).subscribe(
      (response: any) => {
        if (response.ok && Array.isArray(response.treatments)) {
          this.treatments = response.treatments
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
            .slice(0, 3);
        } else {
          console.error('No se pudieron obtener los tratamientos o el formato es incorrecto.');
          this.treatments = [];
        }
      },
      (error) => {
        console.error('Error al obtener tratamientos:', error);
        this.treatments = [];
      }
    );
  }

  private getExercises(pacienteId: string): void {
    if (pacienteId) {
      this.pacienteService.getExercise(pacienteId).subscribe(
        (response: any) => {
          if (response.ok && Array.isArray(response.exercise_routines)) {
            this.exercise = response.exercise_routines
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
              .slice(0, 3); 
          } else {
            console.error('No se pudieron obtener los ejercicios.');
            this.exercise = [];
          }
        },
        (error) => {
          console.error('Error al obtener ejercicios:', error);
          this.exercise = [];
        }
      );
    }
  }

  updateCheckpoint(exercise: any) {
    const pacienteId = localStorage.getItem('pacienteId');
    if (pacienteId) {
      this.pacienteService.updateExerciseCheckpoint(pacienteId, exercise._id, exercise.checkpoint).subscribe(
        () => {},
        (error) => {
          console.error('Error al actualizar checkpoint:', error);
        }
      );
    }
  }

  registrarMedidas() {
    if (!this.measureForm.get('blood_pressure')?.valid) {
      this.showNotification('La presión arterial debe tener el formato 120/80.');
      return;
    }
    if (this.measureForm.valid) {
      const formData = {
        weight: Number(this.measureForm.value.weight),
        heart_rate: Number(this.measureForm.value.heart_rate),
        blood_pressure: String(this.measureForm.value.blood_pressure)
      };
  
      const pacienteId = localStorage.getItem('pacienteId');
  
      if (pacienteId) {
        this.pacienteService.updateNewMeasurements(pacienteId, formData).subscribe(
          () => {
            this.hideForm();
          },
          error => {
            console.error('Error al actualizar medidas:', error);
            this.showNotification('No se han podido registrar las medidas. Revisa los valores.');
          }
        );
      }
    }
  }

  // Oculta el formulario hasta que pasen HORAS_ENTRE_MEDICIONES
  hideForm() {
    localStorage.setItem('ultimaMedicion', String(Date.now()));
    this.showFormAux = false;
    this.resetForm();
  }

  resetForm() {
    this.measureForm.reset();
    this.showWeight = true;
    this.showHeartRate = false;
    this.showBloodPressure = false;
  }

  onOptionSelect(option: string) {
    this.selectedAnswer = option;
  }

  obtenerDiaActual() {
    const hoy = new Date();
    const numeroDia = hoy.getDay(); // 0 es domingo, 1 es lunes, etc.
    
    // Convertir al formato español
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    this.diaActual = diasSemana[numeroDia];
  }
  private getPastilleroToday(pacienteId: string): void {
    this.pacienteService.getPastillero(pacienteId).subscribe(
      (response: any) => {
        if (response.ok && Array.isArray(response.pastillero)) {
          // Buscar el día actual en el pastillero
          this.pastilleroHoy = response.pastillero.find(
            (dia: any) => dia.day === this.diaActual
          );
          
          if (!this.pastilleroHoy) {
            // Si no se encuentra, crear un objeto vacío
            this.pastilleroHoy = {
              day: this.diaActual,
              morning: '',
              afternoon: '',
              night: ''
            };
          }
        } else {
          console.error('No se pudo obtener el pastillero o el formato es incorrecto.');
          this.pastilleroHoy = null;
        }
      },
      (error) => {
        console.error('Error al obtener pastillero:', error);
        this.pastilleroHoy = null;
      }
    );
  }
}
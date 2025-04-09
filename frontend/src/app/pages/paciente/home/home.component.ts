import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';
import { QuestionService } from 'src/app/services/question.service';
import { StateService } from 'src/app/services/state.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {
  treatments: any[] = [];
  exercise: any[] = [];
  pacienteId: any;

  question: any = null;
  selectedAnswer: string = '';
  isProcessing: boolean = false;

  badResponses = [
    'Cansado', 'Muy cansado', 'Mal', 'Muy mal', 'Con dolor', 'Mareado', 
    'Con dificultad para respirar', 'Regular', 'Débil', 'Regular'
  ];

  public measureForm = this.fb.group({
    weight: ['', Validators.required],
    heart_rate: ['', Validators.required],
    blood_pressure: ['', Validators.required]
  });

  showWeight = true;
  showHeartRate = false;
  showBloodPressure = false;
  showFormAux = false;
  showAnsweredAux = false;

  constructor(private stateService: StateService, private fb: FormBuilder, 
    private pacienteService: PacienteService, private questionService: QuestionService, 
    private toastController: ToastController) { }

  ngOnInit() {
    const pacienteId = localStorage.getItem('pacienteId');
    if (pacienteId) {
      //this.pacienteId = pacienteId;
      this.getTreatments(pacienteId);
      this.getExercises(pacienteId);
      this.loadQuestion();
    }
    const showForm = localStorage.getItem('showForm');
    if(showForm){
      this.showFormAux = true;
    }
    const showAnswered = localStorage.getItem('preguntadeldia');
    if(showAnswered){
      this.showAnsweredAux = true;
    }
  }

  loadQuestion() {
    if (this.showAnsweredAux) {
      console.log('⏳ Ya se respondió la pregunta hoy.');
      return;
    }

    this.questionService.getQuestionOfTheDay(this.pacienteId).subscribe(
      (res) => {
        if (res.ok) {
          this.question = res.question;
          //console.log(" Pregunta cargada:", this.question); // Verificar en la consola
          /*if (this.question) {
            console.log("ID de la pregunta:", this.question?._id); // Verificar en la consola
          } else {
            console.error("La pregunta llegó vacía.");
          }*/
        } else {
          //console.log("No hay pregunta hoy:", res.msg);
        }
      },
      (error) => console.error("Error obteniendo la pregunta:", error)
    );
  }

  async submitAnswer() {
    if (!this.selectedAnswer || !this.question || this.isProcessing ) return;

    this.isProcessing = true;

    this.pacienteId = localStorage.getItem('pacienteId');

    try {
      const response = await this.questionService.saveResponse(
        this.pacienteId, 
        this.question._id, 
        this.selectedAnswer
      ).toPromise();

      if (response.ok) {
        console.log('Respuesta guardada con éxito.');
        
        // 2. Comprobar si la respuesta es "mala"
        if (this.isBadResponse(this.selectedAnswer)) {
          await this.handleBadResponse();
        }

        // 3. Actualizar la UI
        this.question = null;
        this.hideQuestion();
        this.isProcessing = false;
      } else {
        console.log(response.msg);
        this.isProcessing = false;
      }
        
     
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
      this.isProcessing = false;
    }
    /*const requestBody = {
      patientId: this.pacienteId, 
      questionId: this.question._id, 
      answer: this.selectedAnswer
    };

    console.log("📤 Enviando datos al backend:", requestBody);

    this.questionService.saveResponse(this.pacienteId, this.question._id, this.selectedAnswer).subscribe(
      (res) => {
        if (res.ok) {
          console.log('Respuesta guardada con éxito.');
          //localStorage.setItem('answeredToday', 'true'); 
          this.question = null;
          this.hideQuestion();
        } else {
          console.log(res.msg);
        }
      },
      (error) => console.error('Error guardando la respuesta:', error)
    );*/
  }

  isBadResponse(answer: string): boolean {
    return this.badResponses.some(badResponse => 
      answer.toLowerCase().includes(badResponse.toLowerCase())
    );
  }

  async handleBadResponse() {
    try {
      const result = await this.pacienteService.addRestExercise(this.pacienteId).toPromise();
      
      if (result.ok) {
        // Actualizar la lista de ejercicios para mostrar el nuevo
        this.getExercises(this.pacienteId);
        
        // Mostrar notificación al usuario
        this.showNotification(
          'Se ha añadido un ejercicio de reposo a tu plan debido a tu respuesta. Cuídate y descansa.'
        );
      }
    } catch (error) {
      console.error('Error al añadir ejercicio de reposo:', error);
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

  get showForm() {
    return this.stateService.showForm;
  }

  submitWeight() {
    if (this.measureForm.get('weight')?.valid) {
      console.log('Peso registrado:', this.measureForm.value.weight);
      this.showWeight = false;
      this.showHeartRate = true;
    }
  }

  submitHeartRate() {
    if (this.measureForm.get('heart_rate')?.valid) {
      console.log('Frecuencia Cardíaca registrada:', this.measureForm.value.heart_rate);
      this.showHeartRate = false;
      this.showBloodPressure = true;
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

  private getExercises(pacienteId :string): void {
    if (pacienteId) {
      this.pacienteService.getExercise(pacienteId).subscribe(
        (response: any) => {
          if (response.ok && Array.isArray(response.exercise_routines)) {
            //console.log(response.exercise_routines);
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
    if(pacienteId){
      this.pacienteService.updateExerciseCheckpoint(pacienteId, exercise._id, exercise.checkpoint).subscribe(
        (response) => {
          console.log('Checkpoint actualizado:', response);
        },
        (error) => {
          console.error('Error al actualizar checkpoint:', error);
        }
      );
    }
  }

  registrarMedidas() {
    if (this.measureForm.get('blood_pressure')?.valid) {
      console.log('Presión Arterial registrada:', this.measureForm.value.blood_pressure);
     
      const formData = {
        weight: Number(this.measureForm.value.weight),
        heart_rate: Number(this.measureForm.value.heart_rate),
        blood_pressure: String(this.measureForm.value.blood_pressure)
      };
  
      const pacienteId = localStorage.getItem('pacienteId');
  
      if (pacienteId) {
        this.pacienteService.updateNewMeasurements(pacienteId, formData).subscribe(
          response => {
            console.log('Medidas actualizadas:', response);
            this.hideForm();
          },
          error => {
            console.error('Error al actualizar medidas:', error);
            //alert('Hubo un error al registrar las medidas.');
          }
        );
      }
    }
  }

  hideQuestion() {
    console.log('Ocultando formulario...'); 
    localStorage.setItem('preguntadeldia', 'false'); 
    this.showAnsweredAux = false;
    setTimeout(() => {
      console.log('Mostrando formulario después de 10 minutos...'); 
      this.resetQuestion();
      
      localStorage.setItem('preguntadeldia', 'true'); 
    }, 24 * 60 * 60 * 1000  ); //10 * 1000 <--- 10 seg 24 * 60 * 60 * 1000
  }

  resetQuestion() {
    this.showAnsweredAux = true;
  }

  hideForm() {
    console.log('Ocultando formulario...'); 
    localStorage.setItem('showForm', 'false'); 
    this.showFormAux = false;
    setTimeout(() => {
      console.log('Mostrando formulario después de 10 minutos...'); 
      this.resetForm();
      
      localStorage.setItem('showForm', 'true'); 
    }, 10 * 1000); //10 * 60 * 1000 <--- 10 minutos
  }

  resetForm() {
    this.showFormAux = true;
    this.measureForm.reset();
    this.showWeight = true;
    this.showHeartRate = false;
    this.showBloodPressure = false;
  }
  onOptionSelect(option: string) {
    this.selectedAnswer = option;
  }
}

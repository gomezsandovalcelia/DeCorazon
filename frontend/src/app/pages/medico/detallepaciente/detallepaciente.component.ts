import { Component, OnInit, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';
import { ToastController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { RespuestaService } from 'src/app/services/respuesta.service';
import { QuestionService } from 'src/app/services/question.service';

Chart.register(...registerables);

interface Measurement {
  date: string;
  weight: number;
  heart_rate: number;
  blood_pressure: string;
}

interface Patient {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  altura?: number; // Altura en cm
  measurements?: Measurement[];
  treatments?: any[];
  exercise_routines?: any[];
}

interface Question {
  _id: string;
  question: string;
  shortId: string;
}

interface PastilleroDay {
  day: string;
  morning: string;
  afternoon: string;
  night: string;
}

@Component({
  selector: 'app-detallepaciente',
  templateUrl: './detallepaciente.component.html',
  styleUrls: ['./detallepaciente.component.scss'],
})

export class DetallepacienteComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  pacienteId!: string;
  paciente: Patient | null = null;
  segmento: string = 'informacion';
  
  tratamientoForm!: FormGroup;
  ejercicioForm!: FormGroup;
  pastilleroForm!: FormGroup;

  chart!: Chart;
  respuestas: any[] = [];
  cargandoRespuestas: boolean = true;
  
  preguntas: Question[] = [];
  cargandoPreguntas: boolean = true;

  pastillero: PastilleroDay[] = [];
  cargandoPastillero: boolean = false;
  diaSeleccionado: string = '';
  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private respuestaService: RespuestaService,
    private questionService: QuestionService
  ) { }

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarPaciente();
    this.cargarRespuestas();
    this.cargarPreguntas();
    this.cargarPastillero();

    this.inicializarFormularios();
  }

  ngAfterViewInit() {
    if (this.segmento === 'informacion' && (this.paciente?.measurements?.length ?? 0) > 0) {
      this.inicializarGrafico();
    }
  }

  inicializarFormularios() {
    this.tratamientoForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: [new Date().toISOString(), Validators.required]
    });

    this.ejercicioForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: [new Date().toISOString(), Validators.required],
      checkpoint: [false]
    });

    this.pastilleroForm = this.formBuilder.group({
      morning: [''],
      afternoon: [''],
      night: ['']
    });
  }

  cargarPastillero() {
    this.cargandoPastillero = true;
    
    this.pacienteService.getPastillero(this.pacienteId).subscribe(
      response => {
        if (response.ok) {
          this.pastillero = response.pastillero;
          this.diaSeleccionado = this.diasSemana[0]; // Seleccionar el primer día por defecto
          this.actualizarFormularioDia();
          console.log('Pastillero cargado:', this.pastillero);
        } else {
          console.error('Error al cargar pastillero:', response.message);
          this.mostrarToast('Error al cargar la información del pastillero');
        }
        this.cargandoPastillero = false;
      },
      error => {
        console.error('Error al cargar pastillero:', error);
        this.mostrarToast('Error al cargar la información del pastillero');
        this.cargandoPastillero = false;
      }
    );
  }

  actualizarFormularioDia() {
    const diaActual = this.pastillero.find(d => d.day === this.diaSeleccionado);
    
    if (diaActual) {
      this.pastilleroForm.patchValue({
        morning: diaActual.morning,
        afternoon: diaActual.afternoon,
        night: diaActual.night
      });
    } else {
      this.pastilleroForm.reset();
    }
  }

  // Método para manejar el cambio de día seleccionado
  cambiarDiaSeleccionado(dia: string) {
    this.diaSeleccionado = dia;
    this.actualizarFormularioDia();
  }

  guardarMedicacionDia() {
    if (!this.diaSeleccionado) {
      this.mostrarToast('Por favor, seleccione un día de la semana');
      return;
    }

    const datos = this.pastilleroForm.value;
    
    this.pacienteService.updateDayMedication(
      this.pacienteId, 
      this.diaSeleccionado, 
      datos
    ).subscribe(
      response => {
        if (response.ok) {
          this.mostrarToast('Medicación actualizada correctamente');
          // Actualizar el pastillero local con los nuevos datos
          const index = this.pastillero.findIndex(d => d.day === this.diaSeleccionado);
          if (index !== -1) {
            this.pastillero[index] = {
              ...this.pastillero[index],
              morning: datos.morning,
              afternoon: datos.afternoon,
              night: datos.night
            };
          }
        } else {
          console.error('Error al actualizar medicación:', response.message);
          this.mostrarToast('Error al actualizar la medicación');
        }
      },
      error => {
        console.error('Error al actualizar medicación:', error);
        this.mostrarToast('Error al actualizar la medicación');
      }
    );
  }
  
  cargarPaciente() {
    this.pacienteService.getPacientePorId(this.pacienteId).subscribe(
      response => {
        if (response.ok) {
          this.paciente = response.paciente;
          console.log('Paciente cargado:', this.paciente);
          setTimeout(() => {
            if (this.segmento === 'informacion' && this.chartCanvas) {
              this.inicializarGrafico();
            }
          }, 100);
        }
      },
      error => {
        console.error('Error al cargar paciente:', error);
        this.mostrarToast('Error al cargar la información del paciente');
      }
    );
  }

  cargarPreguntas() {
    this.cargandoPreguntas = true;
    this.questionService.getAllQuestions().subscribe(
      response => {
        if (response.ok) {
          this.preguntas = response.preguntas;
          console.log('Preguntas cargadas:', this.preguntas);
        } else {
          console.error('Error al cargar preguntas:', response.msg);
        }
        this.cargandoPreguntas = false;
      },
      error => {
        console.error('Error al cargar preguntas:', error);
        this.cargandoPreguntas = false;
        this.mostrarToast('Error al cargar las preguntas del cuestionario');
      }
    );
  }

  agregarTratamiento() {
    if (this.tratamientoForm.valid) {
      const tratamiento = this.tratamientoForm.value;
      
      this.pacienteService.agregarTratamiento(this.pacienteId, tratamiento).subscribe(
        response => {
          if (response.ok) {
            this.mostrarToast('Tratamiento agregado correctamente');
            this.cargarPaciente();
            this.tratamientoForm.reset({
              description: '',
              date: new Date().toISOString()
            });
          }
        },
        error => {
          console.error('Error al agregar tratamiento:', error);
          this.mostrarToast('Error al agregar el tratamiento');
        }
      );
    } else {
      this.mostrarToast('Por favor complete todos los campos requeridos');
    }
  }

  agregarEjercicio() {
    if (this.ejercicioForm.valid) {
      const ejercicio = this.ejercicioForm.value;
      
      this.pacienteService.agregarEjercicio(this.pacienteId, ejercicio).subscribe(
        response => {
          if (response.ok) {
            this.mostrarToast('Ejercicio agregado correctamente');
            this.cargarPaciente();
            this.ejercicioForm.reset({
              description: '',
              date: new Date().toISOString(),
              checkpoint: false
            });
          }
        },
        error => {
          console.error('Error al agregar ejercicio:', error);
          this.mostrarToast('Error al agregar el ejercicio');
        }
      );
    } else {
      this.mostrarToast('Por favor complete todos los campos requeridos');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  cambiarSegmento(evento: any) {
    this.segmento = evento.detail.value;
    setTimeout(() => {
      if (this.segmento === 'informacion' && this.chartCanvas) {
        this.inicializarGrafico();
      }
    }, 100);
  }
  
  cargarRespuestas() {
    this.cargandoRespuestas = true;
    this.respuestaService.obtenerRespuestasPaciente(this.pacienteId).subscribe(
      response => {
        if (response.ok) {
          this.respuestas = response.respuestas.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          console.log('Respuestas cargadas:', this.respuestas);
        } else {
          console.error('Error al cargar respuestas:', response.msg);
        }
        this.cargandoRespuestas = false;
      },
      error => {
        console.error('Error al cargar respuestas:', error);
        this.cargandoRespuestas = false;
      }
    );
  }
  
  obtenerTextoPregunta(questionId: string): string {
    if (this.preguntas && this.preguntas.length > 0) {
      const preguntaEncontrada = this.preguntas.find(p => p._id === questionId);
      if (preguntaEncontrada) {
        return preguntaEncontrada.question;
      }
      
      const preguntaPorShortId = this.preguntas.find(p => p.shortId === questionId);
      if (preguntaPorShortId) {
        return preguntaPorShortId.question;
      }
    }
    
    const preguntasComunes: {[key: string]: string} = {
      'q1': '¿Cómo te encuentras hoy?',
      'q2': '¿Notas ahogo en reposo?',
      'q3': '¿Has subido el número de almohadas para dormir?',
      'q4': '¿Y con los esfuerzos como caminar, tareas de casa...?',
      'q5': '¿Las piernas están más hinchadas?',
    };
    
    if (preguntasComunes[questionId]) {
      return preguntasComunes[questionId];
    }
    
    const shortIdMatch = questionId.match(/q\d+/);
    if (shortIdMatch && preguntasComunes[shortIdMatch[0]]) {
      return preguntasComunes[shortIdMatch[0]];
    }
    
    return 'Pregunta clínica';
  }

  calcularIMC(): number | null {
    //console.log('Calculando IMC...');
    
    if (!this.paciente) {
      //console.log('No hay paciente cargado');
      return null;
    }
    
    if (!this.paciente.altura) {
      //console.log('El paciente no tiene altura registrada');
      return null;
    }
    
    if (!this.paciente.measurements || this.paciente.measurements.length === 0) {
      //console.log('El paciente no tiene mediciones');
      return null;
    }
    
    // Crear una copia para ordenar
    const medicionesOrdenadas = [...this.paciente.measurements];
    
    // Ordenar por fecha de más reciente a más antigua
    medicionesOrdenadas.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Tomar la primera (más reciente)
    const ultimaMedicion = medicionesOrdenadas[0];
    
    //console.log('Última medición:', ultimaMedicion);
    
    if (!ultimaMedicion || !ultimaMedicion.weight) {
      //console.log('La última medición no tiene peso');
      return null;
    }
    
    // Fórmula IMC = peso (kg) / (altura (m))²
    const alturaEnMetros = this.paciente.altura / 100;
    const imc = ultimaMedicion.weight / (alturaEnMetros * alturaEnMetros);
    
    const resultado = parseFloat(imc.toFixed(2));
    //console.log('IMC calculado:', resultado);
    
    return resultado;
  }

  obtenerCategoriaIMC(imc: number): string {
    if (imc < 18.5) {
      return 'Bajo peso';
    } else if (imc >= 18.5 && imc < 25) {
      return 'Peso normal';
    } else if (imc >= 25 && imc < 30) {
      return 'Sobrepeso';
    } else if (imc >= 30 && imc < 35) {
      return 'Obesidad grado 1';
    } else if (imc >= 35 && imc < 40) {
      return 'Obesidad grado 2';
    } else {
      return 'Obesidad grado 3';
    }
  }
// Añadir al componente DetallepacienteComponent
calcularIMCMedicion(peso: number): number | null {
  if (!this.paciente?.altura || !peso) {
    return null;
  }
  
  const alturaEnMetros = this.paciente.altura / 100;
  const imc = peso / (alturaEnMetros * alturaEnMetros);
  
  return parseFloat(imc.toFixed(2));
}


  getClaseIMC(imc: number | null): string {
    if (imc === null) {
      return '';
    }
    
    if (imc < 18.5 || imc >= 30) {
      return 'text-danger';
    }
    
    if (imc >= 25 && imc < 30) {
      return 'text-warning';
    }
    
    return 'text-success';
  }
  evaluarEstadoSalud(medicion: Measurement): number {
    let puntuacion = 0;
    
    // Evaluación del peso
    const peso = medicion.weight;
    if (peso >= 50 && peso <= 90) {
      puntuacion += 25; // Reducido de 33 a 25 para hacer espacio para el IMC
    } else if (peso >= 40 && peso < 50) {
      puntuacion += 15; // Reducido de 20 a 15
    } else if (peso > 90 && peso <= 110) {
      puntuacion += 15; // Reducido de 20 a 15
    } else {
      puntuacion += 5; // Reducido de 10 a 5
    }
    
    // Evaluación del IMC (si está disponible)
    if (this.paciente?.altura) {
      const alturaEnMetros = this.paciente.altura / 100;
      const imc = peso / (alturaEnMetros * alturaEnMetros);
      
      if (imc >= 18.5 && imc < 25) {
        puntuacion += 15; // IMC normal - puntuación máxima
      } else if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc < 30)) {
        puntuacion += 10; // Ligeramente fuera del rango normal
      } else if ((imc >= 16 && imc < 17) || (imc >= 30 && imc < 35)) {
        puntuacion += 5; // Más alejado del rango normal
      } else {
        puntuacion += 2; // Muy alejado del rango normal
      }
    } else {
      // Si no hay altura, mantener la puntuación original del peso
      puntuacion += 8; // Compensación por la falta de evaluación del IMC
    }
    
    // El resto del código de evaluación permanece igual
    const frecuencia = medicion.heart_rate;
    if (frecuencia >= 60 && frecuencia <= 100) {
      puntuacion += 30; 
    } else if ((frecuencia >= 50 && frecuencia < 60) || (frecuencia > 100 && frecuencia <= 110)) {
      puntuacion += 20; 
    } else {
      puntuacion += 10; 
    }
    
    const presion = medicion.blood_pressure;
    try {
      const [sistolica, diastolica] = presion.split('/').map(Number);
      
      if (sistolica >= 90 && sistolica <= 120) {
        puntuacion += 15; 
      } else if (sistolica > 120 && sistolica <= 139) {
        puntuacion += 10; 
      } else if (sistolica > 139) {
        puntuacion += 5; 
      } else if (sistolica < 90) {
        puntuacion += 5; 
      }
      
      if (diastolica >= 60 && diastolica <= 80) {
        puntuacion += 15; 
      } else if (diastolica > 80 && diastolica <= 89) {
        puntuacion += 10; 
      } else if (diastolica > 89) {
        puntuacion += 5; 
      } else if (diastolica < 60) {
        puntuacion += 5; 
      }
    } catch (e) {
      puntuacion += 10; 
    }
    
    return puntuacion;
  }

  inicializarGrafico() {
    if (!this.paciente?.measurements?.length) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const medicionesOrdenadas = [...this.paciente.measurements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const ultimasMediciones = medicionesOrdenadas.slice(-5);
    
    const labels = ultimasMediciones.map(m => new Date(m.date).toLocaleDateString());
    const datos = ultimasMediciones.map(m => this.evaluarEstadoSalud(m));
    
    const pointColors = datos.map(valor => {
      if (valor < 40) return 'rgba(255,0,0,1)';
      if (valor < 60) return 'rgba(255,165,0,1)';
      if (valor < 75) return 'rgba(255,255,0,1)';
      if (valor < 90) return 'rgba(0,255,0,1)';
      return 'rgba(0,0,255,1)';
    });

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Estado general',
          data: datos,
          backgroundColor: 'rgba(148,159,177,0.2)',
          borderColor: 'rgba(148,159,177,1)',
          pointBackgroundColor: pointColors,
          pointBorderColor: '#fff',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Estado de salud (0-100)'
            },
            ticks: {
              maxTicksLimit: window.innerWidth < 768 ? 5 : 10
            }
          },
          x: {
            ticks: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: window.innerWidth >= 768,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  const value = context.parsed.y;
                  let estado = 'Normal';
                  if (value < 40) estado = 'Alarmante';
                  else if (value < 60) estado = 'Deficiente';
                  else if (value < 75) estado = 'Regular';
                  else if (value < 90) estado = 'Bueno';
                  else estado = 'Excelente';
                  
                  label += `${Math.round(value)}/100 (${estado})`;
                }
                return label;
              },
              // Añadir información adicional al tooltip
              afterLabel: (context) => {
                // Obtener la medición correspondiente al punto
                const index = context.dataIndex;
                const medicion = ultimasMediciones[index];
                
                // Calcular el IMC si hay altura disponible
                let imcInfo = '';
                if (this.paciente?.altura && medicion.weight) {
                  const alturaEnMetros = this.paciente.altura / 100;
                  const imc = medicion.weight / (alturaEnMetros * alturaEnMetros);
                  const imcFormateado = imc.toFixed(2);
                  const categoria = this.obtenerCategoriaIMC(imc);
                  
                  imcInfo = `IMC: ${imcFormateado} (${categoria})`;
                }
                
                // Crear un array con la información que queremos mostrar
                const lines = [
                  `Peso: ${medicion.weight} kg`,
                  imcInfo,
                  `FC: ${medicion.heart_rate} ppm`,
                  `PA: ${medicion.blood_pressure}`
                ];
                
                // Filtrar líneas vacías
                return lines.filter(line => line !== '');
              }
            }
          }
        }
      }
    });
  }
}
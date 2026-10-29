import { Component, OnInit, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';
import { ToastController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { RespuestaService } from 'src/app/services/respuesta.service';
import { QuestionService } from 'src/app/services/question.service';
import { SaludService } from 'src/app/services/salud.service';
import { Patient } from 'src/app/interfaces/paciente.interface';

Chart.register(...registerables);

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
    private questionService: QuestionService,
    private saludService: SaludService
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
        } else {
          console.error('Error al cargar pastillero:', response.msg);
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
          console.error('Error al actualizar medicación:', response.msg);
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

  // Los cálculos están en SaludService; estos métodos los usa la plantilla
  calcularIMC(): number | null {
    const ultima = this.saludService.ultimaMedicion(this.paciente?.measurements);
    return this.saludService.calcularIMC(this.paciente?.altura, ultima?.weight);
  }

  calcularIMCMedicion(peso: number): number | null {
    return this.saludService.calcularIMC(this.paciente?.altura, peso);
  }

  obtenerCategoriaIMC(imc: number): string {
    return this.saludService.obtenerCategoriaIMC(imc);
  }

  getClaseIMC(imc: number | null): string {
    return this.saludService.getClaseIMC(imc);
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
    const datos = ultimasMediciones.map(m => this.saludService.evaluarEstadoSalud(m, this.paciente?.altura));
    
    // Los colores salen de los tokens de theme/variables.scss, igual que la leyenda
    const estilos = getComputedStyle(document.documentElement);
    const color = (token: string) => estilos.getPropertyValue(token).trim();
    const pointColors = datos.map(valor => {
      if (valor < 40) return color('--app-estado-alarmante');
      if (valor < 60) return color('--app-estado-inestable');
      if (valor < 75) return color('--app-estado-normal');
      if (valor < 90) return color('--app-estado-bien');
      return color('--app-estado-excelente');
    });

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Estado general',
          data: datos,
          backgroundColor: `rgba(${color('--ion-color-primary-rgb')}, 0.08)`,
          borderColor: color('--ion-color-primary'),
          borderWidth: 3,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#fff',
          pointRadius: 7,
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
                size: window.innerWidth < 768 ? 13 : 15
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
                const imc = this.calcularIMCMedicion(medicion.weight);
                const imcInfo = imc === null ? '' : `IMC: ${imc.toFixed(2)} (${this.obtenerCategoriaIMC(imc)})`;
                
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
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoService } from 'src/app/services/medico.service';
import { PacienteService } from 'src/app/services/paciente.service';
import { ToastController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { RespuestaService } from 'src/app/services/respuesta.service';

Chart.register(...registerables);

interface Measurement {
  date: string;
  weight: number;
  heart_rate: number;
  blood_pressure: string;
}

@Component({
  selector: 'app-detallepaciente',
  templateUrl: './detallepaciente.component.html',
  styleUrls: ['./detallepaciente.component.scss'],
})

export class DetallepacienteComponent  implements OnInit, AfterViewInit  {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  pacienteId!: string;
  paciente: any;
  segmento: string = 'informacion';
  
  tratamientoForm!: FormGroup;
  ejercicioForm!: FormGroup;

  chart!: Chart;
  
  respuestas: any[] = [];
  cargandoRespuestas: boolean = true;

  constructor( private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private respuestaService: RespuestaService
  ) { }

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarPaciente();
    this.cargarRespuestas(); 

    this.inicializarFormularios();
  }

  ngAfterViewInit() {
    // El canvas podría no estar disponible inmediatamente si el segmento no es 'informacion'
    if (this.segmento === 'informacion' && this.paciente?.measurements?.length > 0) {
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
  }

  cargarPaciente() {
    this.pacienteService.getPacientePorId(this.pacienteId).subscribe(
      response => {
        if (response.ok) {
          this.paciente = response.paciente;
          console.log('Paciente cargado:', this.paciente);
          //para la gráfica
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

  agregarTratamiento() {
    if (this.tratamientoForm.valid) {
      const tratamiento = this.tratamientoForm.value;
      
      this.pacienteService.agregarTratamiento(this.pacienteId, tratamiento).subscribe(
        response => {
          if (response.ok) {
            this.mostrarToast('Tratamiento agregado correctamente');
            this.cargarPaciente(); // Recargar paciente para ver cambios
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
            this.cargarPaciente(); // Recargar paciente para ver cambios
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
          // Ordenar por fecha (más recientes primero)
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
    // Mapa de preguntas frecuentes
    const preguntasComunes: {[key: string]: string} = {
      'q1': '¿Cómo te encuentras hoy?',
      'q2': '¿Notas ahogo en reposo?',
      'q3': '¿Has subido el número de almohadas para dormir?',
      'q4': '¿Y con los esfuerzos como caminar, tareas de casa...?',
      'q5': '¿Las piernas están más hinchadas?',
      // Añade más preguntas según las que tengas en la base de datos
    };
    
    // Intenta obtener la pregunta del mapa
    return preguntasComunes[questionId] || 'Pregunta clínica';
  }

  // PARA LA GRAFICA
 
  // Función para evaluar el estado de salud basado en las tres métricas
  evaluarEstadoSalud(medicion: Measurement): number {
    let puntuacion = 0;
    
    // Evaluar peso (asumiendo valores normales entre 50-90kg)
    const peso = medicion.weight;
    if (peso >= 50 && peso <= 90) {
      puntuacion += 33; // Peso normal
    } else if (peso >= 40 && peso < 50) {
      puntuacion += 20; // Bajo peso
    } else if (peso > 90 && peso <= 110) {
      puntuacion += 20; // Sobrepeso
    } else {
      puntuacion += 10; // Peso preocupante
    }
    
    // Evaluar frecuencia cardíaca (normal: 60-100 ppm)
    const frecuencia = medicion.heart_rate;
    if (frecuencia >= 60 && frecuencia <= 100) {
      puntuacion += 33; // Frecuencia normal
    } else if ((frecuencia >= 50 && frecuencia < 60) || (frecuencia > 100 && frecuencia <= 110)) {
      puntuacion += 20; // Ligeramente anormal
    } else {
      puntuacion += 10; // Frecuencia preocupante
    }
    
    // Evaluar presión arterial
    // Formato esperado: "120/80"
    const presion = medicion.blood_pressure;
    try {
      const [sistolica, diastolica] = presion.split('/').map(Number);
      
      // Evaluar presión sistólica (normal: 90-120)
      if (sistolica >= 90 && sistolica <= 120) {
        puntuacion += 17; // Normal
      } else if (sistolica > 120 && sistolica <= 139) {
        puntuacion += 10; // Prehipertensión
      } else if (sistolica > 139) {
        puntuacion += 5; // Hipertensión
      } else if (sistolica < 90) {
        puntuacion += 5; // Hipotensión
      }
      
      // Evaluar presión diastólica (normal: 60-80)
      if (diastolica >= 60 && diastolica <= 80) {
        puntuacion += 17; // Normal
      } else if (diastolica > 80 && diastolica <= 89) {
        puntuacion += 10; // Prehipertensión
      } else if (diastolica > 89) {
        puntuacion += 5; // Hipertensión
      } else if (diastolica < 60) {
        puntuacion += 5; // Hipotensión
      }
    } catch (e) {
      puntuacion += 10; // Error en el formato, asignamos puntuación mínima
    }
    
    return puntuacion;
  }

  inicializarGrafico() {
    if (!this.paciente?.measurements?.length) {
      return;
    }

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Ordenar mediciones por fecha
    const medicionesOrdenadas = [...this.paciente.measurements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Tomar las últimas 5 (o menos si no hay suficientes)
    const ultimasMediciones = medicionesOrdenadas.slice(-5);
    
    // Crear datos para el gráfico
    const labels = ultimasMediciones.map(m => new Date(m.date).toLocaleDateString());
    const datos = ultimasMediciones.map(m => this.evaluarEstadoSalud(m));
    
    // Generar colores según los valores
    const pointColors = datos.map(valor => {
      if (valor < 40) return 'rgba(255,0,0,1)'; // Rojo (alarmante)
      if (valor < 60) return 'rgba(255,165,0,1)'; // Naranja (deficiente)
      if (valor < 75) return 'rgba(255,255,0,1)'; // Amarillo (regular)
      if (valor < 90) return 'rgba(0,255,0,1)'; // Verde (bueno)
      return 'rgba(0,0,255,1)'; // Azul (excelente)
    });

    // Crear el gráfico
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
      // Dentro de las opciones del Chart
      options: {
        responsive: true,
        maintainAspectRatio: false, // Esto es importante para el ajuste de altura
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Estado de salud (0-100)'
            },
            ticks: {
              // Menos ticks en pantallas pequeñas
              maxTicksLimit: window.innerWidth < 768 ? 5 : 10
            }
          },
          x: {
            ticks: {
              // Ajustar tamaño de fuente en pantallas pequeñas
              font: {
                size: window.innerWidth < 768 ? 10 : 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: window.innerWidth >= 768, // Ocultar leyenda en móviles
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
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
              }
            }
          }
        }
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoService } from 'src/app/services/medico.service';
import { PacienteService } from 'src/app/services/paciente.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-detallepaciente',
  templateUrl: './detallepaciente.component.html',
  styleUrls: ['./detallepaciente.component.scss'],
})
export class DetallepacienteComponent  implements OnInit {
  pacienteId!: string;
  paciente: any;
  segmento: string = 'informacion';
  
  tratamientoForm!: FormGroup;
  ejercicioForm!: FormGroup;

  constructor( private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private formBuilder: FormBuilder,
    private toastController: ToastController) { }

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarPaciente();
    
    this.inicializarFormularios();
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
  }
}

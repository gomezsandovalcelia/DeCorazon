import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';

@Component({
  selector: 'app-mesures',
  templateUrl: './mesures.component.html',
  styleUrls: ['./mesures.component.scss'],
})
export class MesuresComponent  implements OnInit {
 public measureForm = this.fb.group({
    weight: [''],
    heart_rate: [''],
    blood_pressure: ['']
  });

  constructor(private fb: FormBuilder, private pacienteService: PacienteService) { }

  ngOnInit() {
    // Initialize form with default values or fetch initial data if needed
    this.measureForm.setValue({
      weight: '',
      heart_rate: '',
      blood_pressure: ''
    });
  }
  registrarMedidas(){
    if(this.measureForm.valid){
      console.log('Medidas registradas');

      const formData = {
        weight: Number(this.measureForm.value.weight),
        heart_rate: Number(this.measureForm.value.heart_rate),
        blood_pressure: String(this.measureForm.value.blood_pressure)
      };

      const pacienteId = localStorage.getItem('pacienteId');

      if(pacienteId){
        this.pacienteService.updateNewMeasurements(pacienteId, formData).subscribe(
          response => {
            console.log('Medidas actualizadas:', response);
            alert('Medidas registradas exitosamente');
          },
          error => {
            console.error('Error al actualizar medidas:', error);
            alert('Hubo un error al registrar las medidas.');
          }
        );
      }
    }
  }
}

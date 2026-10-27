import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PacienteService } from 'src/app/services/paciente.service';
import { VALIDADORES_MEDIDAS } from 'src/app/interfaces/measurements-form.interface';

@Component({
  selector: 'app-mesures',
  templateUrl: './mesures.component.html',
  styleUrls: ['./mesures.component.scss'],
})
export class MesuresComponent {
  public measureForm = this.fb.group({
    weight: ['', VALIDADORES_MEDIDAS.weight],
    heart_rate: ['', VALIDADORES_MEDIDAS.heart_rate],
    blood_pressure: ['', VALIDADORES_MEDIDAS.blood_pressure]
  });

  constructor(private fb: FormBuilder, private pacienteService: PacienteService) { }

  registrarMedidas(){
    if(this.measureForm.valid){
      const formData = {
        weight: Number(this.measureForm.value.weight),
        heart_rate: Number(this.measureForm.value.heart_rate),
        blood_pressure: String(this.measureForm.value.blood_pressure)
      };

      const pacienteId = localStorage.getItem('pacienteId');

      if(pacienteId){
        this.pacienteService.updateNewMeasurements(pacienteId, formData).subscribe(
          () => {
            // La home usa esta marca para no volver a pedir medidas hasta pasadas unas horas
            localStorage.setItem('ultimaMedicion', String(Date.now()));
            this.measureForm.reset();
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

import { Component, OnInit } from '@angular/core';
import { PacienteService } from 'src/app/services/paciente.service';

@Component({
  selector: 'app-routine',
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.scss'],
})
export class RoutineComponent  implements OnInit {
  exercise: any[] = [];
  constructor(private pacienteService: PacienteService) { }

  ngOnInit() {
    const pacienteId = localStorage.getItem('pacienteId'); // Obtener el ID del paciente desde localStorage
    if (pacienteId) {
      this.getExercises(pacienteId);
    }
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
}

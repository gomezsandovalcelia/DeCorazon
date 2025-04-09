import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { HomeComponent } from './paciente/home/home.component';
import { HomeComponent as MedicoHomeComponent } from './medico/home/home.component';
import { MesuresComponent } from './paciente/mesures/mesures.component';
import { RoutineComponent } from './paciente/routine/routine.component';
import { TreatmentsComponent } from './paciente/treatments/treatments.component';
import { PerfilComponent } from './paciente/perfil/perfil.component';
import { PerfilComponent as MedicoPerfilComponent} from './medico/perfil/perfil.component';
import { PreguntasFrecuentesComponent } from './paciente/preguntas-frecuentes/preguntas-frecuentes.component';
import { AuthGuard } from '../guards/auth.guard';
import { DetallepacienteComponent } from './medico/detallepaciente/detallepaciente.component';

const routes: Routes = [
  {
    path: '', 
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PACIENTE'] },
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'medidas', component: MesuresComponent },
      { path: 'ejercicios', component: RoutineComponent },
      { path: 'tratamiento', component: TreatmentsComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'preguntas-frecuentes', component: PreguntasFrecuentesComponent }
    ]
  },
  {
    path: 'medico',
    component: AdminLayoutComponent, // Puedes usar el mismo layout o crear uno específico
    canActivate: [AuthGuard],
    data: { roles: ['MEDICO'] },
    children: [
      { path: 'dashboard', component: MedicoHomeComponent },
      { path: 'perfil', component: MedicoPerfilComponent },
      { path: 'detalle-paciente/:id', component: DetallepacienteComponent }, // Reemplaza con el componente adecuado
      // Añade aquí más rutas para médicos cuando tengas los componentes
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
 /* { 
    path: '', component: AdminLayoutComponent, 
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'medidas', component: MesuresComponent },
      { path: 'ejercicios', component: RoutineComponent },
      { path: 'tratamiento', component: TreatmentsComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'preguntas-frecuentes', component: PreguntasFrecuentesComponent }
    ]
  },/*
  { path: 'home1', component: HomeComponent },
  { path: 'medidas', component: MesuresComponent },
  { path: 'ejercicios', component: RoutineComponent },
  { path: 'tratamiento', component: TreatmentsComponent },
  { path: 'perfil', component: PerfilComponent }*/
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

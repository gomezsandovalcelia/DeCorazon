import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { HomeComponent } from './paciente/home/home.component';
import { MesuresComponent } from './paciente/mesures/mesures.component';
import { RoutineComponent } from './paciente/routine/routine.component';
import { TreatmentsComponent } from './paciente/treatments/treatments.component';


const routes: Routes = [
  { 
    path: '', component: AdminLayoutComponent, 
    children: [
      { path: 'home', component: HomeComponent }
    ]
  },
  { path: 'home1', component: HomeComponent },
  { path: 'medidas', component: MesuresComponent },
  { path: 'ejercicios', component: RoutineComponent },
  { path: 'tratamiento', component: TreatmentsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

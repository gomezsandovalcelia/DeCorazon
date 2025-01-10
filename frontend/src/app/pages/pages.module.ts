import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { MenuComponent } from '../commons/menu/menu.component';
import { HomeComponent } from './paciente/home/home.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MesuresComponent } from './paciente/mesures/mesures.component';
import { TreatmentsComponent } from './paciente/treatments/treatments.component';
import { RoutineComponent } from './paciente/routine/routine.component';



@NgModule({
  declarations: [
    AdminLayoutComponent,
    MenuComponent,
    HomeComponent,
    MesuresComponent,
    TreatmentsComponent,
    RoutineComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  
})
export class PagesModule { }

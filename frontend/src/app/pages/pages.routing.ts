import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';


const routes: Routes = [
  { path: 'dashboard', component: AdminLayoutComponent,
    children: [
    { path: '**', redirectTo: ''}
  ]},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

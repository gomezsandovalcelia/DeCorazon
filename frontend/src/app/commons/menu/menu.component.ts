import { Component } from '@angular/core';

interface ItemMenu {
  ruta: string;
  icono: string; // Nombre del icono de Material Symbols
  texto: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  items: ItemMenu[] = [
    { ruta: '/home', icono: 'home', texto: 'Inicio' },
    { ruta: '/medidas', icono: 'monitor_heart', texto: 'Medidas' },
    { ruta: '/tratamiento', icono: 'pill', texto: 'Medicación' },
    { ruta: '/ejercicios', icono: 'directions_walk', texto: 'Ejercicios' },
    { ruta: '/perfil', icono: 'person', texto: 'Perfil' },
  ];
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-routine',
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.scss'],
})
export class RoutineComponent  implements OnInit {
  items = [
    { name: 'Correr 30 minutos', checked: false },
    { name: 'Caminar durante 2 horas', checked: false },
    { name: 'Trotar 40 minutos', checked: false },
    { name: 'Montar en bicicleta 15 minutos', checked: false },
  ];
  constructor() { }

  ngOnInit() {}

}

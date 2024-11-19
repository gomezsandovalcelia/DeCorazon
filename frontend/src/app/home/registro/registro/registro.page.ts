import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage  {
  customCounterFormatter(length: number, maxlength: number): string {
    return `${length} de ${maxlength} caracteres usados`;
  }
  constructor() { }

  

}

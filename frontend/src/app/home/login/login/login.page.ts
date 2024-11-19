import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  customCounterFormatter(length: number, maxlength: number): string {
    return `${length} de ${maxlength} caracteres usados`;
  }
}


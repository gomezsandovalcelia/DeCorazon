import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private _showForm = true;

  get showForm() {
    return this._showForm;
  }

  set showForm(value: boolean) {
    this._showForm = value;
  }

  setTime(){
    setTimeout(() => {
      this._showForm = true; 
    }, 1 * 60 * 1000);
  }
}

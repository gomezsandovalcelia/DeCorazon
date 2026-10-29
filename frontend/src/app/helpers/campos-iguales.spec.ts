import { FormControl, FormGroup, Validators } from '@angular/forms';
import { camposIguales } from './campos-iguales';

describe('camposIguales', () => {
  const crearForm = () => new FormGroup({
    password: new FormControl('123456'),
    repetir: new FormControl('', Validators.required)
  }, { validators: camposIguales('password', 'repetir') });

  it('marca el error en el grupo y en el campo repetido si no coinciden', () => {
    const form = crearForm();
    form.controls.repetir.setValue('otra');
    expect(form.hasError('camposDistintos')).toBeTrue();
    expect(form.controls.repetir.hasError('camposDistintos')).toBeTrue();
  });

  it('quita el error cuando coinciden', () => {
    const form = crearForm();
    form.controls.repetir.setValue('otra');
    form.controls.repetir.setValue('123456');
    expect(form.valid).toBeTrue();
    expect(form.controls.repetir.errors).toBeNull();
  });

  it('vuelve a comprobarse al cambiar el primer campo', () => {
    const form = crearForm();
    form.controls.repetir.setValue('123456');
    form.controls.password.setValue('cambiada');
    expect(form.controls.repetir.hasError('camposDistintos')).toBeTrue();
  });

  it('conserva los demás errores del campo repetido', () => {
    const form = crearForm();
    form.controls.password.setValue('');
    expect(form.controls.repetir.hasError('required')).toBeTrue();
    expect(form.controls.repetir.hasError('camposDistintos')).toBeFalse();
  });
});

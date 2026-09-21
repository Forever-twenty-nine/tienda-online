import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  open = input(false);
  title = input('Confirmación');
  message = input('¿Estás seguro?');
  confirmText = input('Aceptar');
  cancelText = input('Cancelar');
  confirm = output<void>();
  cancel = output<void>();
}

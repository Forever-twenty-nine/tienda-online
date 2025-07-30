import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  @Input() open = false;
  @Input() title = 'Confirmación';
  @Input() message = '¿Estás seguro?';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

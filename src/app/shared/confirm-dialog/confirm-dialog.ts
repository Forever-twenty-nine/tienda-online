import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {

  /** controla visibilidad del modal */
  @Input() open = false;

  /** texto del encabezado */
  @Input() title = 'Confirmación';

  /** mensaje principal */
  @Input() message = '¿Estás seguro?';

  /** texto del botón de confirmar */
  @Input() confirmText = 'Aceptar';

  /** texto del botón de cancelar */
  @Input() cancelText = 'Cancelar';

  /** evento disparado al confirmar */
  @Output() confirm = new EventEmitter<void>();

  /** evento disparado al cancelar o cerrar */
  @Output() cancel = new EventEmitter<void>();

}

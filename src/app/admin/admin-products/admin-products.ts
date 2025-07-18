import { Component, inject } from '@angular/core';

import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-products',
  imports: [CurrencyPipe, NgOptimizedImage, ConfirmDialog],
  templateUrl: './admin-products.html',
})
export class AdminProducts {

  // ⚙️ Inyectamos el servicio de productos y el router
  productsService = inject(ProductsService);
  router = inject(Router);
  // ⚠️ estado del modal de confirmación
  showConfirm = false;
  deletingId: string | null = null;

  // ➕ crea uno nuevo
  onNew() {
    this.router.navigate(['/admin', 'products', 'new']);
  }
  // ✏️ editar existente
  onEdit(id: string) {
    this.router.navigate(['/admin', 'products', id]);
  }
  // 🗑 borrar (implementa delete() en tu servicio)
  // 🗑 Preparar confirmación de borrado
  onDelete(id: string) {
    this.deletingId = id;
    this.showConfirm = true;
  }

  // ✅ Confirmar y ejecutar borrado
  onConfirmDelete() {
    if (this.deletingId) {
      this.productsService.delete(this.deletingId);
    }
    this.showConfirm = false;
    this.deletingId = null;
  }

  // ❌ Cancelar borrado
  onCancelDelete() {
    this.showConfirm = false;
    this.deletingId = null;
  }

}

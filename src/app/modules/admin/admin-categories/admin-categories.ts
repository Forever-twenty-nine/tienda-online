import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog, DragDropModule],
  templateUrl: './admin-categories.html',
})
export class AdminCategories {
  categoriesService = inject(CategoriesService);

  // Estado para el formulario de agregar/editar
  isEditing = signal(false);
  currentCategoryId = signal<string | null>(null);
  categoryName = signal('');

  // Estado para el modal de confirmación de borrado
  showConfirm = false;
  deletingId: string | null = null;

  async onDrop(event: CdkDragDrop<Category[]>) {
    const categories = [...this.categoriesService.categories()];
    moveItemInArray(categories, event.previousIndex, event.currentIndex);
    
    // Solo actualizar si el orden cambió realmente
    if (event.previousIndex !== event.currentIndex) {
      await this.categoriesService.reorderCategories(categories);
    }
  }

  onEdit(category: Category) {
    this.isEditing.set(true);
    this.currentCategoryId.set(category.id);
    this.categoryName.set(category.nombre);
  }

  async onSubmit() {
    if (!this.categoryName().trim()) return;

    if (this.isEditing() && this.currentCategoryId()) {
      await this.categoriesService.updateCategory(this.currentCategoryId()!, this.categoryName());
    } else {
      await this.categoriesService.addCategory(this.categoryName());
    }

    this.resetForm();
  }

  onDelete(id: string) {
    this.deletingId = id;
    this.showConfirm = true;
  }

  async onConfirmDelete() {
    if (this.deletingId) {
      await this.categoriesService.deleteCategory(this.deletingId);
    }
    this.showConfirm = false;
    this.deletingId = null;
  }

  onCancelDelete() {
    this.showConfirm = false;
    this.deletingId = null;
  }

  resetForm() {
    this.isEditing.set(false);
    this.currentCategoryId.set(null);
    this.categoryName.set('');
  }
}

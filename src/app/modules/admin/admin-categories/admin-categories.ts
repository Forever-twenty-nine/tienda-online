import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoriesService } from '../../../core/services/categories.service';
import { Rubro, Category, Subcategory } from '../../../core/models/category.model';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog, DragDropModule],
  templateUrl: './admin-categories.html',
})
export class AdminCategories {
  categoriesService = inject(CategoriesService);

  // Nivel seleccionado (0: Rubro, 1: Categoria, 2: Subcategoria)
  activeLevel = signal<number>(0);

  // Formulario
  isEditing = signal(false);
  currentId = signal<string | null>(null);
  name = signal('');
  parentId = signal<string | null>(null);

  // Confirmación
  showConfirm = false;
  deletingId: string | null = null;

  async onDrop(event: CdkDragDrop<any[]>) {
    const level = this.activeLevel();
    if (level === 0) {
      const items = [...this.categoriesService.rubros()];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      if (event.previousIndex !== event.currentIndex) await this.categoriesService.reorderRubros(items);
    } else if (level === 1) {
      const items = [...this.categoriesService.categories()];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      if (event.previousIndex !== event.currentIndex) await this.categoriesService.reorderCategories(items);
    } else {
      const items = [...this.categoriesService.subcategories()];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      if (event.previousIndex !== event.currentIndex) await this.categoriesService.reorderSubcategories(items);
    }
  }

  onEdit(item: any) {
    this.isEditing.set(true);
    this.currentId.set(item.id);
    this.name.set(item.nombre);
    const level = this.activeLevel();
    if (level === 1) this.parentId.set(item.rubroId || null);
    if (level === 2) this.parentId.set(item.categoryId || null);
  }

  async onSubmit() {
    if (!this.name().trim()) return;
    const level = this.activeLevel();
    const id = this.currentId();
    const nombre = this.name();
    const pId = this.parentId();

    if (this.isEditing() && id) {
      if (level === 0) await this.categoriesService.updateRubro(id, nombre);
      else if (level === 1) await this.categoriesService.updateCategory(id, nombre, pId);
      else await this.categoriesService.updateSubcategory(id, nombre, pId);
    } else {
      if (level === 0) await this.categoriesService.addRubro(nombre);
      else if (level === 1) await this.categoriesService.addCategory(nombre, pId);
      else await this.categoriesService.addSubcategory(nombre, pId);
    }
    this.resetForm();
  }

  onDelete(id: string) {
    this.deletingId = id;
    this.showConfirm = true;
  }

  async onConfirmDelete() {
    if (this.deletingId) {
      const level = this.activeLevel();
      if (level === 0) await this.categoriesService.deleteRubro(this.deletingId);
      else if (level === 1) await this.categoriesService.deleteCategory(this.deletingId);
      else await this.categoriesService.deleteSubcategory(this.deletingId);
    }
    this.showConfirm = false;
    this.deletingId = null;
  }

  resetForm() {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.name.set('');
    this.parentId.set(null);
  }

  setLevel(l: number) {
    this.activeLevel.set(l);
    this.resetForm();
  }

  getRubroName(id?: string): string {
    return this.categoriesService.rubros().find(r => r.id === id)?.nombre || '-';
  }

  getCategoryName(id?: string): string {
    return this.categoriesService.categories().find(c => c.id === id)?.nombre || '-';
  }
}


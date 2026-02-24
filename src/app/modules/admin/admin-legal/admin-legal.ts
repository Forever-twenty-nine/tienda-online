import { Component, inject, OnInit, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-legal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './admin-legal.html'
})
export class AdminLegalComponent implements OnInit {
  private settingsService = inject(SettingsService);

  // El tipo de página se pasa por ruta o input: 'terms' o 'privacy'
  type = input.required<string>();
  
  title = signal('');
  content = signal('');
  isLoading = signal(true);
  isSaving = signal(false);
  showSuccessModal = signal(false);

  constructor() {
    effect(() => {
      // Al usar el signal this.type() aquí, el effect se ejecutará cada vez que cambie
      this.loadData();
    });
  }

  ngOnInit() {}

  async loadData() {
    this.isLoading.set(true);
    try {
      const data = await this.settingsService.getPageContent(this.type());
      if (data) {
        this.title.set(data.title);
        this.content.set(data.content);
      } else {
        // Valores por defecto
        const defaultTitles: Record<string, string> = {
          'terms': 'Términos y Condiciones',
          'privacy': 'Política de Privacidad',
          'returns': 'Política de Devoluciones',
          'about': 'Sobre Nosotros'
        };
        this.title.set(defaultTitles[this.type()] || 'Contenido Editable');
        this.content.set('');
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async save() {
    this.isSaving.set(true);
    try {
      await this.settingsService.savePageContent(this.type(), this.title(), this.content());
      this.showSuccessModal.set(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el contenido');
    } finally {
      this.isSaving.set(false);
    }
  }
}

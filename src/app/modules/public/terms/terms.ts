import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../core/services/settings.service';
import { PageContent } from '../../../core/models/settings.model';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  // imports limpios, header/footer van en layout
  templateUrl: './terms.html'
})
export class TermsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  
  pageData = signal<PageContent | null>(null);
  isLoading = signal(true);

  async ngOnInit() {
    const data = await this.settingsService.getPageContent('terms');
    this.pageData.set(data);
    this.isLoading.set(false);
  }
}

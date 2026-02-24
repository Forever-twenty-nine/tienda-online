import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../core/services/settings.service';
import { PageContent } from '../../../core/models/settings.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  // imports limpios, header/footer van en layout
  templateUrl: './about.html'
})
export class AboutComponent implements OnInit {
  private settingsService = inject(SettingsService);
  
  pageData = signal<PageContent | null>(null);
  isLoading = signal(true);

  async ngOnInit() {
    const data = await this.settingsService.getPageContent('about');
    this.pageData.set(data);
    this.isLoading.set(false);
  }
}

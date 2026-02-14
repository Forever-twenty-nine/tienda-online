import { Component, inject } from '@angular/core';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-returns',
  standalone: true,
  // imports limpios, header/footer van en layout
  templateUrl: './returns.html'
})
export class ReturnsComponent {
  public contactService = inject(ContactService);
}

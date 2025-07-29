import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './privacy.html'
})
export class PrivacyComponent {

}

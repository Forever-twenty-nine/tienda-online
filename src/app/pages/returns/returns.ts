import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './returns.html'
})
export class ReturnsComponent {

}

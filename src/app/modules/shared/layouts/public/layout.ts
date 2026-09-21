
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header';
import { FooterComponent } from '../../../components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './layout.html',
})
export class PublicLayoutComponent {}

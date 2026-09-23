import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * ¿Dónde está el comparador?
 * - Plantilla: `iphone-comparator.html`
 * - Se monta en `home.html` (línea 143), entre Top ventas y Why Us.
 * - Data hardcodeada acá abajo en `IPHONES`. Sin Firestore, sin inputs.
 */

interface IPhoneSpec {
  nombre: string;
  slug: string;
  precio: number;
  cuota12: number;
  destacado: string;
  chip: string;
  pantalla: string;
  camara: string;
  bateria: string; // horas de reproducción de video
  conector: string;
  capacidadMin: string;
  colores: number;
}

/**
 * Comparador de iPhones — Componente presentación puro.
 *
 * Datos: specs oficiales de Apple (julio 2026 AR) hardcodeadas en el componente.
 * Si en el futuro se quiere tomar la data del modelo Product, se reemplaza
 * `IPHONES` por una signal computada que filtre `allProducts()` por subcategoriaId.
 *
 * Estilo Apple: una sección dedicada entre el featured grid y el "por qué elegirnos".
 * Tabla responsive con scroll horizontal en mobile y sticky first-column.
 */
@Component({
  selector: 'app-iphone-comparator',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './iphone-comparator.html',
})
export class IPhoneComparator {
  readonly IPHONES: IPhoneSpec[] = [
    {
      nombre: 'iPhone 13',
      slug: 'iphone-13',
      precio: 1299000,
      cuota12: 108250,
      destacado: '',
      chip: 'A15 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '12 MP · 12 MP',
      bateria: '19 hs',
      conector: 'Lightning',
      capacidadMin: '128 GB',
      colores: 5,
    },
    {
      nombre: 'iPhone 14',
      slug: 'iphone-14',
      precio: 1499000,
      cuota12: 124917,
      destacado: '',
      chip: 'A15 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '12 MP · 12 MP',
      bateria: '20 hs',
      conector: 'Lightning',
      capacidadMin: '128 GB',
      colores: 6,
    },
    {
      nombre: 'iPhone 15',
      slug: 'iphone-15',
      precio: 1799000,
      cuota12: 134917, // con 10% OFF
      destacado: '10% OFF',
      chip: 'A16 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '48 MP · 12 MP',
      bateria: '20 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
      colores: 5,
    },
    {
      nombre: 'iPhone 16',
      slug: 'iphone-16',
      precio: 1999000,
      cuota12: 166583,
      destacado: '',
      chip: 'A18',
      pantalla: '6.1" Super Retina XDR',
      camara: '48 MP Fusion · 12 MP',
      bateria: '22 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
      colores: 5,
    },
    {
      nombre: 'iPhone 16 Pro',
      slug: 'iphone-16-pro',
      precio: 2599000,
      cuota12: 216583,
      destacado: '',
      chip: 'A18 Pro',
      pantalla: '6.3" ProMotion',
      camara: '48 MP Fusion · 12 MP · 12 MP',
      bateria: '27 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
      colores: 4,
    },
  ];

  /** Devuelve el slug para construir el link a la ficha del iPhone. */
  slugFor(nombre: string): string {
    return this.IPHONES.find(p => p.nombre === nombre)?.slug ?? '';
  }
}
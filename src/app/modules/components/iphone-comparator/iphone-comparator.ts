import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import type { Product } from '../../../core/models/product.model';

/**
 * Comparador de iPhones — Componente presentación puro.
 *
 * Data: las specs (`chip`, `pantalla`, `camara`, `bateria`, `conector`,
 * `capacidadMin`) vienen de `Product.specs` (cargado desde Firestore).
 * Filtra `allProducts()` por `subcategoriaId` que empieza con `iphone-`
 * y que tengan `specs` definido. Orden estable por `subcategoriaId`.
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
  private productsService = inject(ProductsService);

  /**
   * Productos iPhone con `specs` definidos, en orden estable por
   * `subcategoriaId` (iphone-13 → iphone-16-pro). Mientras Firestore no
   * haya entregado la colección, el array está vacío y la sección no
   * renderiza contenido (el contenedor queda visible pero sin filas).
   */
  readonly IPHONES = computed(() => {
    return this.productsService.allProducts()
      .filter(p => p.subcategoriaId?.startsWith('iphone-') && p.specs)
      .sort((a, b) => (a.subcategoriaId ?? '').localeCompare(b.subcategoriaId ?? ''))
      .map(p => this.toSpec(p));
  });

  /** Mapea un Product a la estructura que el template necesita. */
  private toSpec(p: Product): IPhoneSpec {
    const specs = p.specs!;
    const effectivePrice = (p.descuento && p.descuento > 0)
      ? p.precio * (1 - p.descuento / 100)
      : p.precio;
    return {
      nombre: p.nombre,
      slug: p.slug ?? '',
      precio: p.precio,
      cuota12: Math.round(effectivePrice / 12),
      destacado: p.descuento && p.descuento > 0 ? `${p.descuento}% OFF` : '',
      chip: specs.chip,
      pantalla: specs.pantalla,
      camara: specs.camara,
      bateria: specs.bateria,
      conector: specs.conector,
      capacidadMin: specs.capacidadMin,
      colores: p.colores?.length ?? 0,
    };
  }
}

/** Forma de fila que consume el template. Privada al componente. */
interface IPhoneSpec {
  nombre: string;
  slug: string;
  precio: number;
  cuota12: number;
  destacado: string;
  chip: string;
  pantalla: string;
  camara: string;
  bateria: string;
  conector: string;
  capacidadMin: string;
  colores: number;
}
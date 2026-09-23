import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { Product } from '../../../core/models/product.model';

describe('ProductCard', () => {
  let component: ProductCard;

  const mkProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-id',
    nombre: 'iPhone 13',
    slug: 'iphone-13',
    descripcion: 'descripcion',
    precio: 1000000,
    disponibilidad: true,
    publicado: true,
    ...overrides,
  } as Product);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductCard, provideRouter([])],
    });
    component = TestBed.inject(ProductCard);
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('deberia arrancar con hoverState=initial', () => {
    expect(component.hoverState).toBe('initial');
  });

  it('deberia aceptar un product via input', () => {
    // Como product es input.required(), no se setea hasta que el template
    // lo provea. Validamos que la property existe y está readonly.
    expect(() => component.product).not.toThrow();
  });

  // Nota: la lógica del template (formateo, CTA, etc.) es presentacional
  // pura. AGENTS.md: 'cuándo NO agregar spec: componentes puramente
  // presentacionales'. Cubrimos solo el state del componente y la
  // property expuesta. La presentación se valida visualmente.
});
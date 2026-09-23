import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { IPhoneComparator } from './iphone-comparator';
import { ProductsService } from '../../../core/services/products';
import { Product } from '../../../core/models/product.model';

class ProductsServiceStub {
  allProducts = signal<Product[]>([]);
}

describe('IPhoneComparator', () => {
  let component: IPhoneComparator;
  let productsStub: ProductsServiceStub;

  beforeEach(() => {
    productsStub = new ProductsServiceStub();
    TestBed.configureTestingModule({
      providers: [
        IPhoneComparator,
        { provide: ProductsService, useValue: productsStub },
      ],
    });
    component = TestBed.inject(IPhoneComparator);
  });

  function mkProduct(overrides: Partial<Product> = {}): Product {
    return {
      id: 'x',
      nombre: 'iPhone X',
      descripcion: '',
      precio: 1000000,
      disponibilidad: true,
      publicado: true,
      ...overrides,
    } as Product;
  }

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia devolver [] cuando no hay productos', () => {
    expect(component.IPHONES()).toEqual([]);
  });

  it('deberia filtrar solo productos con subcategoriaId iphone-* y specs', () => {
    productsStub.allProducts.set([
      mkProduct({ id: '1', nombre: 'iPhone 13', subcategoriaId: 'iphone-13' }),
      mkProduct({ id: '2', nombre: 'Accesorio', subcategoriaId: 'otro' }),
      mkProduct({ id: '3', nombre: 'iPhone sin specs', subcategoriaId: 'iphone-14' }),
      mkProduct({
        id: '4',
        nombre: 'iPhone 15',
        subcategoriaId: 'iphone-15',
        specs: { chip: 'A16', pantalla: '6.1"', camara: '48', bateria: '20', conector: 'USB-C', capacidadMin: '128 GB' },
      }),
    ]);
    const result = component.IPHONES();
    expect(result.length).toBe(1);
    expect(result[0].nombre).toBe('iPhone 15');
  });

  it('deberia ordenar por subcategoriaId (lexicografico)', () => {
    productsStub.allProducts.set([
      mkProduct({ id: '1', nombre: 'iPhone 16 Pro', subcategoriaId: 'iphone-16-pro',
        specs: { chip: 'A18 Pro', pantalla: '6.3"', camara: '48', bateria: '27', conector: 'USB-C', capacidadMin: '128 GB' } }),
      mkProduct({ id: '2', nombre: 'iPhone 13', subcategoriaId: 'iphone-13',
        specs: { chip: 'A15', pantalla: '6.1"', camara: '12', bateria: '19', conector: 'Lightning', capacidadMin: '128 GB' } }),
      mkProduct({ id: '3', nombre: 'iPhone 15', subcategoriaId: 'iphone-15',
        specs: { chip: 'A16', pantalla: '6.1"', camara: '48', bateria: '20', conector: 'USB-C', capacidadMin: '128 GB' } }),
    ]);
    const nombres = component.IPHONES().map(s => s.nombre);
    expect(nombres).toEqual(['iPhone 13', 'iPhone 15', 'iPhone 16 Pro']);
  });

  it('deberia computar cuota12 = round(precio / 12) sin descuento', () => {
    productsStub.allProducts.set([
      mkProduct({
        id: '1', nombre: 'iPhone 13', subcategoriaId: 'iphone-13', precio: 1299000,
        specs: { chip: 'A15', pantalla: '6.1"', camara: '12', bateria: '19', conector: 'Lightning', capacidadMin: '128 GB' },
      }),
    ]);
    expect(component.IPHONES()[0].cuota12).toBe(Math.round(1299000 / 12));
    expect(component.IPHONES()[0].destacado).toBe('');
  });

  it('deberia computar cuota12 con descuento aplicado al precio efectivo', () => {
    productsStub.allProducts.set([
      mkProduct({
        id: '1', nombre: 'iPhone 15', subcategoriaId: 'iphone-15', precio: 1799000, descuento: 10,
        specs: { chip: 'A16', pantalla: '6.1"', camara: '48', bateria: '20', conector: 'USB-C', capacidadMin: '128 GB' },
      }),
    ]);
    const row = component.IPHONES()[0];
    const expected = Math.round(1799000 * 0.9 / 12); // 10% off
    expect(row.cuota12).toBe(expected);
    expect(row.destacado).toBe('10% OFF');
  });

  it('deberia contar colores como length del array', () => {
    productsStub.allProducts.set([
      mkProduct({
        id: '1', nombre: 'iPhone 13', subcategoriaId: 'iphone-13',
        colores: [{ nombre: 'Rosa', hex: '#x' }, { nombre: 'Azul', hex: '#x' }],
        specs: { chip: 'A15', pantalla: '6.1"', camara: '12', bateria: '19', conector: 'Lightning', capacidadMin: '128 GB' },
      }),
    ]);
    expect(component.IPHONES()[0].colores).toBe(2);
  });

  it('deberia ser reactivo (recomputed cuando allProducts cambia)', () => {
    expect(component.IPHONES().length).toBe(0);
    productsStub.allProducts.set([
      mkProduct({
        id: '1', nombre: 'iPhone 13', subcategoriaId: 'iphone-13',
        specs: { chip: 'A15', pantalla: '6.1"', camara: '12', bateria: '19', conector: 'Lightning', capacidadMin: '128 GB' },
      }),
    ]);
    expect(component.IPHONES().length).toBe(1);
  });
});
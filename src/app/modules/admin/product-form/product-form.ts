import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-product-form',
  imports: [ ReactiveFormsModule, ConfirmDialog, NgClass],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './product-form.html',
})
export class ProductForm {

  // ⚙️ Inyectamos dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  /** alias público para la señal de uploading */
  public readonly uploading = this.service.uploading;

  /** Señal para las imágenes del producto */
  images = signal<string[]>([]);

  // 🆔 Ruta param "id" como señal
  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  // ⚠️ estado del modal de confirmación
  showConfirm = false;

  // 🔍 Computed: buscamos en el servicio el producto actual (si estamos editando)
  current = computed(() =>
    this.service.products().find(p => p.id === this.id())
  );
  // 📝 Título dinámico según si es edición o creación
  title = computed(() =>
    this.id() ? 'Editar producto' : 'Nuevo producto'
  );
  // 🖊️ Formulario reactivo
  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, Validators.required],
    descuento: [0, [Validators.min(0), Validators.max(100)]],
    imagen: [''],
    imagenes: [[]],
    rubroId: [''],
    categoriaId: [''],
    subcategoriaId: [''],
    destacado: [false],
    disponibilidad: [true],
    publicado: [true],
    /** Variantes de color (FormArray de FormGroup con `nombre` y `hex`). */
    colores: this.fb.array([]),
    /** Capacidades de almacenamiento (FormArray de FormControl strings). */
    capacidades: this.fb.array([])
  });

  // 📝 Computed para rubros, categorías y subcategorías filtradas
  rubros = this.categoriesService.rubros;

  categories = computed(() => {
    const rubroId = this.form.get('rubroId')?.value;
    const all = this.categoriesService.categories();
    return rubroId ? all.filter(c => c.rubroId === rubroId) : all;
  });

  subcategories = computed(() => {
    const catId = this.form.get('categoriaId')?.value;
    const all = this.categoriesService.subcategories();
    return catId ? all.filter(s => s.categoryId === catId) : all;
  });

  /** Getter tipado del FormArray de colores. */
  get coloresFA(): FormArray<FormGroup> {
    return this.form.get('colores') as FormArray<FormGroup>;
  }

  /** Getter tipado del FormArray de capacidades. */
  get capacidadesFA(): FormArray<FormControl<string>> {
    return this.form.get('capacidades') as FormArray<FormControl<string>>;
  }

  constructor() {
    // Escuchar cambios en rubro para limpiar categorías
    this.form.get('rubroId')?.valueChanges.subscribe(() => {
      this.form.patchValue({ categoriaId: '', subcategoriaId: '' }, { emitEvent: false });
    });
    // Escuchar cambios en categoría para limpiar subcategorías
    this.form.get('categoriaId')?.valueChanges.subscribe(() => {
      this.form.patchValue({ subcategoriaId: '' }, { emitEvent: false });
    });

    // 🔄 Effect: cuando 'current' cambie (carga de productos), parcheamos el formulario
    effect(() => {
      const prod = this.current();
      if (this.id() && prod) {
        // Cargar datos escalares primero
        this.form.patchValue(prod);
        // Establecer imágenes
        if (prod.imagenes) {
          this.images.set(prod.imagenes);
        } else if (prod.imagen) {
          this.images.set([prod.imagen]);
        }
        // Reemplazar FormArrays de variantes con la data del producto
        this.resetColores(prod.colores ?? []);
        this.resetCapacidades(prod.capacidades ?? []);
      }
    });
  }

  /** Vacía el FormArray de colores y lo llena con los provistos. */
  private resetColores(items: { nombre: string; hex: string }[]): void {
    this.coloresFA.clear();
    for (const c of items) {
      this.coloresFA.push(this.fb.group({
        nombre: [c.nombre, Validators.required],
        hex: [c.hex, [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]]
      }));
    }
  }

  /** Vacía el FormArray de capacidades y lo llena con los provistos. */
  private resetCapacidades(items: string[]): void {
    this.capacidadesFA.clear();
    for (const cap of items) {
      this.capacidadesFA.push(this.fb.nonNullable.control(cap, Validators.required));
    }
  }

  /** Agrega un color vacío al FormArray. */
  addColor(): void {
    this.coloresFA.push(this.fb.group({
      nombre: ['', Validators.required],
      hex: ['#000000', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]]
    }));
  }

  /** Quita el color en `index` del FormArray. */
  removeColor(index: number): void {
    this.coloresFA.removeAt(index);
  }

  /** Agrega una capacidad vacía al FormArray. */
  addCapacity(): void {
    this.capacidadesFA.push(this.fb.nonNullable.control('', Validators.required));
  }

  /** Quita la capacidad en `index` del FormArray. */
  removeCapacity(index: number): void {
    this.capacidadesFA.removeAt(index);
  }

  // 💾 Al enviar: creamos o actualizamos según exista `id`.
  // Omitimos `colores` y `capacidades` si están vacíos para no ensuciar Firestore.
  onSubmit() {
    if (this.form.invalid) return;
    const raw = this.form.value as Omit<Product, 'id' | 'colores' | 'capacidades'> & {
      colores?: { nombre: string; hex: string }[];
      capacidades?: string[];
    };
    const colores = (raw.colores ?? [])
      .filter(c => c?.nombre?.trim() && c?.hex?.trim())
      .map(c => ({ nombre: c.nombre.trim(), hex: c.hex.trim() }));
    const capacidades = (raw.capacidades ?? [])
      .map(c => (c ?? '').trim())
      .filter(c => c);
    // El id del producto es opcional en `addProduct` (auto-id de Firestore) y
    // obligatorio en `updateProduct`. Construimos `data` con tipo laxo para no
    // chocar contra TS y casteamos al传递给 los services según corresponda.
    const data = {
      ...raw,
      id: this.id() ?? '',
      colores: colores.length ? colores : undefined,
      capacidades: capacidades.length ? capacidades : undefined,
    } as unknown as Product;
    if (this.id()) {
      this.service.updateProduct(data);
    } else {
      this.service.addProduct(data);
    }
    this.router.navigate(['/admin', 'products']);
  }

  // ↩️ Cancelar y volver al listado
  onCancel() {
    this.router.navigate(['/admin', 'products']);
  }

  // 🗑️ Métodos para eliminar
  onDelete() {
    this.showConfirm = true;
  }

  onConfirmDelete() {
    const productId = this.id();
    if (productId) {
      this.service.deleteProduct(productId);
      this.showConfirm = false;
      this.router.navigate(['/admin', 'products']);
    }
  }

  onCancelDelete() {
    this.showConfirm = false;
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    if (this.images().length >= 3) {
      alert('Solo se permiten hasta 3 imágenes');
      return;
    }

    const file = input.files[0];

    // Subir imagen y obtener URL
    const url = await this.service.uploadImage(file);

    // Actualizar lista de imágenes
    const currentImages = [...this.images(), url];
    this.images.set(currentImages);
    this.form.patchValue({ imagenes: currentImages });

    // Si es la primera imagen, ponerla como principal automáticamente
    if (currentImages.length === 1) {
      this.form.patchValue({ imagen: url });
    }
  }

  // Método para remover imagen
  removeImage(index: number) {
    const currentImages = this.images().filter((_, i) => i !== index);
    const removedUrl = this.images()[index];
    const currentMainImage = this.form.get('imagen')?.value;

    this.images.set(currentImages);
    this.form.patchValue({ imagenes: currentImages });

    // Si la imagen eliminada era la principal, actualizar
    if (currentMainImage === removedUrl) {
      this.form.patchValue({ imagen: currentImages[0] || '' });
    }
  }

  setMainImage(url: string) {
    this.form.patchValue({ imagen: url });
  }
}

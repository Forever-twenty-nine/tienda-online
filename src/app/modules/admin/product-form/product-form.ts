import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
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
    publicado: [true]
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
        this.form.patchValue(prod);
        // Establecer imágenes si existen
        if (prod.imagenes) {
          this.images.set(prod.imagenes);
        } else if (prod.imagen) {
          // Si solo tiene la imagen principal antigua, la ponemos en la lista
          this.images.set([prod.imagen]);
        }
      }
    });
  }

  // ... rest of methods

  // 💾 Al enviar: creamos o actualizamos según exista `id`
  onSubmit() {
    if (this.form.invalid) return;
    const data = { ...(this.form.value as Omit<Product, 'id'>), id: this.id()! };
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

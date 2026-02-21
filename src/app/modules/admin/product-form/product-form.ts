import { Component, computed, effect, inject, signal } from '@angular/core';
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

  /** Señal para las categorías */
  public readonly categories = this.categoriesService.categories;

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
    categoriaId: [''],
    destacado: [false],
    disponibilidad: [true],
    publicado: [true]
  });

  constructor() {
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

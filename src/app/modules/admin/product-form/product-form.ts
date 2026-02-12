import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [ ReactiveFormsModule],
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

  /** Señal para la vista previa de la imagen */
  imagePreview = signal<string | null>(null);

  // 🆔 Ruta param "id" como señal
  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  // �� Computed: buscamos en el servicio el producto actual (si estamos editando)
  current = computed(() =>
    this.service.products().find(p => p.id === this.id())
  );
  // 📝 Título dinámico según si es edición o creación
  title = computed(() =>
    this.id() ? '✏️ Editar producto' : '🆕 Nuevo producto'
  );
  // 🖊️ Formulario reactivo
  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, Validators.required],
    imagen: [''],
    categoriaId: [''],
    destacado: [false]
  });

  constructor() {
    // 🔄 Effect: cuando 'current' cambie (carga de productos), parcheamos el formulario
    effect(() => {
      const prod = this.current();
      if (this.id() && prod) {
        this.form.patchValue(prod);
        // Establecer vista previa si hay imagen
        if (prod.imagen) {
          this.imagePreview.set(prod.imagen);
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

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    
    // Crear vista previa inmediata usando FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Subir imagen y actualizar formulario
    const url = await this.service.uploadImage(file);
    this.form.patchValue({ imagen: url });
    // Actualizar vista previa con la URL final
    this.imagePreview.set(url);
  }

  // Método para remover imagen
  removeImage() {
    this.imagePreview.set(null);
    this.form.patchValue({ imagen: '' });
  }
}

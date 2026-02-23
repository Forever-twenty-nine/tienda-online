import { Component, inject, signal, OnInit, AfterViewInit, ViewChild, ElementRef, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, FormsModule],
  templateUrl: './catalog.html'
})
export class CatalogComponent implements OnInit, AfterViewInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

  @ViewChild('sentinel') sentinel!: ElementRef;

  searchTerm = '';

  // Breadcrumbs
  breadcrumbs = computed(() => {
    const list = [];
    const rubroId = this.productsService.rubroFilter();
    const catId = this.productsService.categoryFilter();
    const subId = this.productsService.subcategoryFilter();

    if (rubroId) {
      const r = this.categoriesService.rubros().find(x => x.id === rubroId);
      if (r) list.push({ label: r.nombre, tipo: 0, id: r.id });
    }
    if (catId) {
      const c = this.categoriesService.categories().find(x => x.id === catId);
      if (c) list.push({ label: c.nombre, tipo: 1, id: c.id });
    }
    if (subId) {
      const s = this.categoriesService.subcategories().find(x => x.id === subId);
      if (s) list.push({ label: s.nombre, tipo: 2, id: s.id });
    }
    return list;
  });

  // Items para mostrar en el selector (Rubros, Categorías o Subcategorías)
  selectorItems = computed(() => {
    const rubroId = this.productsService.rubroFilter();
    const catId = this.productsService.categoryFilter();
    const subId = this.productsService.subcategoryFilter();

    if (subId || catId) {
      // Si estamos en sub o cat, mostramos las subcategorías de la categoría actual
      const currentCatId = subId 
        ? this.categoriesService.subcategories().find(s => s.id === subId)?.categoryId 
        : catId;
      return this.categoriesService.subcategories()
        .filter(s => s.categoryId === currentCatId)
        .map(s => ({ ...s, tipo: 2 }));
    }

    if (rubroId) {
      // Si estamos en rubro, mostramos sus categorías
      return this.categoriesService.categories()
        .filter(c => c.rubroId === rubroId)
        .map(c => ({ ...c, tipo: 1 }));
    }

    // Por defecto mostramos rubros
    return this.categoriesService.rubros().map(r => ({ ...r, tipo: 0 }));
  });

  ngOnInit() {
    this.searchTerm = this.productsService.searchTerm();
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.productsService.hasMore()) {
        this.productsService.loadMore();
      }
    }, { threshold: 0.1 });

    observer.observe(this.sentinel.nativeElement);
  }

  onSearchChange() { this.productsService.setSearchTerm(this.searchTerm); }
  clearSearch() { this.searchTerm = ''; this.productsService.clearSearch(); }

  selectLevel(item: any) {
    if (item.tipo === 0) this.productsService.setRubro(item.id);
    else if (item.tipo === 1) this.productsService.setCategory(item.id);
    else if (item.tipo === 2) this.productsService.setSubcategory(item.id);
  }

  clearAll() { this.productsService.clearFilters(); }

  get currentTitle(): string {
    const b = this.breadcrumbs();
    return b.length > 0 ? b[b.length-1].label : 'Catálogo';
  }
}


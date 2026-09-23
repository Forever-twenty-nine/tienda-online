import { Component, inject, signal, OnInit, AfterViewInit, ViewChild, ElementRef, computed, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  /** Auto-pobla min/max en el primer render con los bounds del dataset. */
  priceRangeBounds = this.productsService.priceBounds;
  hasSecondaryFilter = computed(() =>
    this.productsService.featuredFilter() !== null
    || this.productsService.discountFilter() !== null
    || this.productsService.stockFilter() !== null
    || this.productsService.priceMin() !== null
    || this.productsService.priceMax() !== null
  );

  setFeatured(v: boolean): void {
    const cur = this.productsService.featuredFilter();
    this.productsService.setFeatured(cur === v ? null : v);
  }
  setDiscount(v: boolean): void {
    const cur = this.productsService.discountFilter();
    this.productsService.setDiscount(cur === v ? null : v);
  }
  setStock(v: boolean): void {
    const cur = this.productsService.stockFilter();
    this.productsService.setStock(cur === v ? null : v);
  }

  /** Aplica un nuevo precio al setter, manteniendo el otro extremo en null si está sin tope. */
  onPriceMinInput(value: string | number | null): void {
    const v = this.parsePriceInput(value, this.productsService.priceMin(), this.priceRangeBounds()[0]);
    const cur = this.productsService.priceMax();
    this.productsService.setPriceRange(v, cur);
  }
  onPriceMaxInput(value: string | number | null): void {
    const v = this.parsePriceInput(value, this.productsService.priceMax(), this.priceRangeBounds()[1]);
    const cur = this.productsService.priceMin();
    this.productsService.setPriceRange(cur, v);
  }

  private parsePriceInput(v: string | number | null, current: number | null, fallback: number): number | null {
    if (v === null || v === '') return null;
    const n = typeof v === 'string' ? Number(v.replace(/\D/g, '')) : v;
    if (!Number.isFinite(n) || n <= 0) return current;
    return n;
  }

  clearSecondary(): void {
    this.productsService.clearSecondaryFilters();
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


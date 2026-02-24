import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';
import { ContactService } from '../../../core/services/contact.service';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [NgOptimizedImage, ProductCard],
    templateUrl: './product-detail.html'
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productsService = inject(ProductsService);
    private contactService = inject(ContactService);
    private categoriesService = inject(CategoriesService);

    slug = toSignal(this.route.paramMap.pipe(map(params => params.get('slug'))));
    product = signal<Product | null>(null);
    selectedImage = signal<string | null>(null);
    loading = signal(true);
    error = signal(false);

    productCategory = computed(() => {
        const currentProduct = this.product();
        const categories = this.categoriesService.categories();
        if (!currentProduct || !categories.length) return null;
        return categories.find(c => c.id === currentProduct.categoriaId) || null;
    });

    relatedProducts = computed(() => {
        const currentProduct = this.product();
        const allProducts = this.productsService.allProducts().filter(p => p.publicado !== false);
        
        if (!currentProduct || !allProducts.length) return [];

        // 1. Intentar obtener productos de la misma categoría (excluyendo el actual)
        let related = allProducts.filter(p => p.id !== currentProduct.id && p.categoriaId === currentProduct.categoriaId);
        
        // 2. Si no hay suficientes, completar con otros productos aleatorios (excluyendo el actual y los ya seleccionados)
        if (related.length < 4) {
            const otherProducts = allProducts
                .filter(p => p.id !== currentProduct.id && p.categoriaId !== currentProduct.categoriaId)
                .sort(() => Math.random() - 0.5);
            
            related = [...related, ...otherProducts];
        }

        // 3. Mezclar y tomar los primeros 4
        return related
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
    });

    constructor() {
        // Efecto para buscar el producto cuando la lista de productos o el slug cambie
        effect(() => {
            const slug = this.slug();
            const allProducts = this.productsService.allProducts();
            
            if (slug && allProducts.length > 0) {
                const foundProduct = allProducts.find(p => p.slug === slug);
                if (foundProduct && foundProduct.publicado !== false) {
                    this.product.set(foundProduct);
                    // Priorizar imagen principal, luego la primera de la lista, luego null
                    const mainImage = foundProduct.imagen || (foundProduct.imagenes && foundProduct.imagenes.length > 0 ? foundProduct.imagenes[0] : null);
                    this.selectedImage.set(mainImage);
                    this.loading.set(false);
                    this.error.set(false);
                    // Scroll al inicio al cambiar de producto
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    this.error.set(true);
                    this.loading.set(false);
                }
            }
        });
    }

    selectImage(url: string) {
        this.selectedImage.set(url);
    }

    ngOnInit() {
        if (!this.route.snapshot.paramMap.get('slug')) {
            this.router.navigate(['/']);
        }
    }

    goBack() {
        this.router.navigate(['/catalogo']);
    }

    goToHome() {
        this.router.navigate(['/']);
    }

    goToCatalog() {
        this.productsService.setCategory(null);
        this.router.navigate(['/catalogo']);
    }

    goToCategory(categoryId: string) {
        this.productsService.setCategory(categoryId);
        this.router.navigate(['/catalogo']);
    }

    contactWhatsApp() {
        
        const currentProduct = this.product();
        if (!currentProduct) return;
        const contactInfo = this.contactService.contactInfo();
        const phoneNumber = contactInfo?.whatsapp || '5492615564713'; 

        const hasDiscount = currentProduct.descuento && currentProduct.descuento > 0;
        const finalPrice = hasDiscount 
            ? currentProduct.precio * (1 - currentProduct.descuento! / 100)
            : currentProduct.precio;

        const priceText = hasDiscount
            ? `*${finalPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}* (Oferta ${currentProduct.descuento}% OFF, antes ${currentProduct.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })})`
            : `*${currentProduct.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*`;

        const message = `Hola! 

Estoy interesado/a en el siguiente producto de su tienda:

*${currentProduct.nombre}*
Precio: ${priceText}

${currentProduct.descripcion}

Podrian darme mas informacion sobre este producto?

Gracias!`;

        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);

        // Crear la URL de WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Abrir WhatsApp en una nueva pestaña
        window.open(whatsappUrl, '_blank');
    }
}

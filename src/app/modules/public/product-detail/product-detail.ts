import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { ProductsService } from '../../../core/services/products';
import { Product } from '../../../core/models/product.model';
import { ContactService } from '../../../core/services/contact.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, CurrencyPipe],
    templateUrl: './product-detail.html'
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productsService = inject(ProductsService);
    private contactService = inject(ContactService);

    product = signal<Product | null>(null);
    loading = signal(true);
    error = signal(false);

    constructor() {
        // Efecto para buscar el producto cuando la lista de productos cambie
        effect(() => {
            const slug = this.route.snapshot.paramMap.get('slug');
            const allProducts = this.productsService.allProducts();
            
            if (slug && allProducts.length > 0) {
                const foundProduct = allProducts.find(p => p.slug === slug);
                if (foundProduct && foundProduct.publicado !== false) {
                    this.product.set(foundProduct);
                    this.loading.set(false);
                    this.error.set(false);
                } else {
                    this.error.set(true);
                    this.loading.set(false);
                }
            }
        });
    }

    ngOnInit() {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (!slug) {
            this.router.navigate(['/']);
        }
    }

    goBack() {
        this.router.navigate(['/catalogo']);
    }

    contactWhatsApp() {
        
        const currentProduct = this.product();
        if (!currentProduct) return;
        const contactInfo = this.contactService.contactInfo();
        const phoneNumber = contactInfo?.whatsapp || '5492615564713'; 
        const message = `Hola! 

Estoy interesado/a en el siguiente producto de su tienda:

*${currentProduct.nombre}*
Precio: ${currentProduct.precio.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}

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

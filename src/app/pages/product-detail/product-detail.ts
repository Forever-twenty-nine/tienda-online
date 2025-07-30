import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products';
import { Product } from '../../models/product.model';

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

    product = signal<Product | null>(null);
    loading = signal(true);
    error = signal(false);

    ngOnInit() {
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
            this.loadProduct(productId);
        } else {
            this.router.navigate(['/']);
        }
    }

    private loadProduct(id: string) {
        // Buscar el producto en la lista actual
        const foundProduct = this.productsService.products().find(p => p.id === id);

        if (foundProduct) {
            this.product.set(foundProduct);
            this.loading.set(false);
        } else {
            // Si no se encuentra, puede que aún no se hayan cargado los productos
            // Esperamos un poco y volvemos a intentar
            setTimeout(() => {
                const retryProduct = this.productsService.products().find(p => p.id === id);
                if (retryProduct) {
                    this.product.set(retryProduct);
                    this.loading.set(false);
                } else {
                    this.error.set(true);
                    this.loading.set(false);
                }
            }, 1000);
        }
    }

    goBack() {
        this.router.navigate(['/']);
    }

    contactWhatsApp() {
        
        const currentProduct = this.product();
        if (!currentProduct) return;
        const phoneNumber = '5492615564713'; 
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

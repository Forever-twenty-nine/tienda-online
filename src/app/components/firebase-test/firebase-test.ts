import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-firebase-test',
  imports: [CommonModule],
  template: `
    <div class="p-4 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-6 text-center">🔍 Diagnóstico de Firebase</h2>
      
      <!-- Estado de la conexión -->
      <div class="mb-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4 flex items-center">
          📊 Estado de la conexión
          <span class="ml-2 px-2 py-1 text-xs rounded-full"
                [class]="products().length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
            {{ products().length > 0 ? 'Conectado' : 'Sin datos' }}
          </span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded">
            <p class="text-sm text-blue-600 font-medium">Productos cargados</p>
            <p class="text-2xl font-bold text-blue-800">{{ products().length }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded">
            <p class="text-sm text-purple-600 font-medium">Estado del servicio</p>
            <p class="text-lg font-semibold text-purple-800">{{ uploading() ? 'Cargando...' : 'Listo' }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <p class="text-sm text-gray-600 font-medium">Último test</p>
            <p class="text-lg font-semibold text-gray-800">{{ lastTestTime() || 'Nunca' }}</p>
          </div>
        </div>
      </div>

      <!-- Acciones de prueba -->
      <div class="mb-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">🛠️ Herramientas de prueba</h3>
        <div class="flex flex-wrap gap-3">
          <button 
            (click)="testConnection()"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center">
            🔄 Probar Conexión
          </button>
          <button 
            (click)="createTestProduct()"
            [disabled]="uploading()"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center">
            ➕ Crear Producto de Prueba
          </button>
          <button 
            (click)="clearLog()"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center">
            🧹 Limpiar Log
          </button>
        </div>
      </div>

      <!-- Log de eventos -->
      <div class="mb-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">📋 Log de eventos</h3>
        <div class="bg-gray-900 text-green-400 p-4 rounded max-h-64 overflow-y-auto font-mono text-sm">
          @for (log of eventLog(); track $index) {
            <div class="mb-1">{{ log }}</div>
          } @empty {
            <div class="text-gray-500">No hay eventos registrados</div>
          }
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">📦 Productos disponibles</h3>
        <div class="space-y-3">
          @for (product of products(); track product.id) {
            <div class="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h4 class="font-medium text-lg text-gray-900">{{ product.nombre }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ product.descripcion }}</p>
                  <p class="text-xl font-bold text-green-600 mt-2">\${{ product.precio }}</p>
                </div>
                @if (product.imagen) {
                  <img [src]="product.imagen" [alt]="product.nombre" 
                       class="w-16 h-16 object-cover rounded ml-4">
                }
              </div>
              <div class="mt-2 text-xs text-gray-500">
                ID: {{ product.id }}
              </div>
            </div>
          } @empty {
            <div class="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
              <div class="text-6xl mb-4">🤔</div>
              <p class="text-yellow-800 font-medium mb-2">No se encontraron productos</p>
              <p class="text-yellow-700 text-sm">
                Esto puede indicar un problema de configuración de Firebase o que la colección 'products' está vacía.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class FirebaseTestComponent {
  private productsService = inject(ProductsService);
  private errorHandler = inject(ErrorHandlerService);
  
  products = this.productsService.products;
  uploading = this.productsService.uploading;
  
  eventLog = signal<string[]>([]);
  lastTestTime = signal<string>('');

  constructor() {
    this.addLog('🚀 Componente de diagnóstico inicializado');
  }

  testConnection() {
    const timestamp = new Date().toLocaleTimeString();
    this.lastTestTime.set(timestamp);
    
    this.addLog(`🔍 [${timestamp}] Iniciando prueba de conexión...`);
    this.addLog(`📊 Productos disponibles: ${this.products().length}`);
    this.addLog(`⚡ Estado de carga: ${this.uploading() ? 'Cargando' : 'Listo'}`);
    
    if (this.products().length === 0) {
      this.addLog('⚠️  No hay productos disponibles');
      this.addLog('💡 Revisa la consola del navegador para errores de Firebase');
    } else {
      this.addLog('✅ Conexión a Firebase funcionando correctamente');
    }
  }

  async createTestProduct() {
    try {
      this.addLog('🔄 Creando producto de prueba...');
      
      const testProduct = {
        nombre: `Producto Test ${Date.now()}`,
        descripcion: 'Producto creado desde el diagnóstico',
        precio: Math.floor(Math.random() * 1000) + 10,
        imagen: 'https://via.placeholder.com/200x150?text=Test+Product'
      };

      await this.productsService.addProduct(testProduct);
      this.addLog('✅ Producto de prueba creado exitosamente');
      
    } catch (error) {
      this.addLog('❌ Error al crear producto de prueba');
      this.errorHandler.logError(error, 'Crear producto de prueba');
    }
  }

  clearLog() {
    this.eventLog.set([]);
    this.addLog('🧹 Log limpiado');
  }

  private addLog(message: string) {
    const current = this.eventLog();
    this.eventLog.set([...current, message]);
  }
}

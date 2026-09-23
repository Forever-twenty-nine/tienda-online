import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  logError(error: any, context: string = ''): void {
    console.group(`🚨 Error en ${context || 'aplicación'}`);
    console.error('Detalles del error:', error);
    
    if (error?.code) {
      console.log('Código de error:', error.code);
    }
    
    if (error?.message) {
      console.log('Mensaje:', error.message);
    }
    
    if (error?.details) {
      console.log('Detalles:', error.details);
    }
    
    // Información específica para errores de Firebase
    if (this.isFirebaseError(error)) {
      this.handleFirebaseError(error);
    }
    
    console.groupEnd();
  }

  private isFirebaseError(error: any): boolean {
    return error?.code && (
      error.code.includes('firestore') ||
      error.code.includes('auth') ||
      error.code.includes('storage') ||
      error.code === 'CONFIGURATION_NOT_FOUND'
    );
  }

  private handleFirebaseError(error: any): void {
    // Firebase SDK devuelve códigos prefijados ("auth/wrong-password",
    // "storage/permission-denied", "firestore/unavailable") pero también
    // se ven a veces sin prefijo ("CONFIGURATION_NOT_FOUND"). Tomamos el
    // sufijo (ultimo segmento despues de '/') para switchear uniforme.
    const code = String(error.code ?? '').split('/').pop() ?? '';
    switch (code) {
      case 'CONFIGURATION_NOT_FOUND':
        console.log('💡 Solución sugerida: Verificar configuración de Firebase');
        console.log('   - Revisar archivo environment.ts');
        console.log('   - Verificar reglas de Firestore');
        console.log('   - Confirmar que el proyecto existe en Firebase Console');
        break;
      case 'permission-denied':
        console.log('💡 Solución sugerida: Problema de permisos');
        console.log('   - Revisar reglas de seguridad en Firestore');
        console.log('   - Verificar autenticación del usuario');
        break;
      case 'unavailable':
        console.log('💡 Solución sugerida: Servicio no disponible');
        console.log('   - Verificar conexión a internet');
        console.log('   - Revisar estado de Firebase');
        break;
      default:
        console.log('💡 Error de Firebase no reconocido');
    }
  }

  getErrorMessage(error: any): string {
    if (error?.code === 'CONFIGURATION_NOT_FOUND') {
      return 'Error de configuración de Firebase. Revisa la consola para más detalles.';
    }
    
    return error?.message || 'Ha ocurrido un error inesperado';
  }
}

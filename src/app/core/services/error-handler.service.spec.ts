import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('deberia devolver mensaje específico para CONFIGURATION_NOT_FOUND', () => {
      const error = { code: 'CONFIGURATION_NOT_FOUND', message: 'cfg not found' };
      expect(service.getErrorMessage(error)).toBe(
        'Error de configuración de Firebase. Revisa la consola para más detalles.'
      );
    });

    it('deberia devolver error.message cuando el código no es CONFIGURATION_NOT_FOUND', () => {
      expect(service.getErrorMessage({ code: 'permission-denied', message: 'denegado' })).toBe('denegado');
      expect(service.getErrorMessage({ code: 'auth/wrong-password', message: 'wrong' })).toBe('wrong');
    });

    it('deberia devolver mensaje genérico cuando no hay message ni codigo conocido', () => {
      expect(service.getErrorMessage(null)).toBe('Ha ocurrido un error inesperado');
      expect(service.getErrorMessage(undefined)).toBe('Ha ocurrido un error inesperado');
      expect(service.getErrorMessage({ code: 'x' })).toBe('Ha ocurrido un error inesperado');
    });

    it('deberia devolver mensaje genérico cuando el codigo es desconocido y no hay message', () => {
      expect(service.getErrorMessage({ code: 'unknown-code' })).toBe('Ha ocurrido un error inesperado');
    });
  });

  describe('logError', () => {
    let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('deberia abrir un grupo con el context', () => {
      service.logError({ code: 'auth/wrong-password' }, 'login');
      expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 Error en login');
    });

    it('deberia usar "aplicacion" como context por defecto', () => {
      service.logError({ code: 'x' });
      expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 Error en aplicación');
    });

    it('deberia loggear code, message, details si el error los tiene', () => {
      service.logError({ code: 'auth/wrong-password', message: 'wrong', details: 'extra' });
      expect(consoleLogSpy).toHaveBeenCalledWith('Código de error:', 'auth/wrong-password');
      expect(consoleLogSpy).toHaveBeenCalledWith('Mensaje:', 'wrong');
      expect(consoleLogSpy).toHaveBeenCalledWith('Detalles:', 'extra');
    });

    it('deberia loggear error.code como details de Firebase cuando es firestore/auth/storage', () => {
      service.logError({ code: 'firestore/something-unknown' });
      // verifica que handleFirebaseError lo loggeo con la sugerencia
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '💡 Error de Firebase no reconocido'
      );
    });

    it('deberia loggear sugerencia para permission-denied', () => {
      service.logError({ code: 'storage/permission-denied' });
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Solución sugerida: Problema de permisos');
    });

    it('deberia loggear sugerencia para unavailable', () => {
      // isFirebaseError matchea cuando el code incluye 'auth'/'firestore'/'storage';
      // los reales son 'auth/unavailable', 'firestore/unavailable', etc.
      service.logError({ code: 'firestore/unavailable' });
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Solución sugerida: Servicio no disponible');
    });

    it('deberia llamar console.groupEnd al finalizar', () => {
      service.logError({ code: 'x' });
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal';

describe('ModalComponent', () => {
  let component: ModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalComponent],
    });
    component = TestBed.inject(ModalComponent);
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('onBackdropClick', () => {
    it('deberia emitir close solo si target == currentTarget', () => {
      let emitted = false;
      component.close.subscribe(() => (emitted = true));
      // mock: un evento donde target === currentTarget (click en el backdrop)
      const fakeEvent = { target: 'backdrop-el', currentTarget: 'backdrop-el' } as unknown as MouseEvent;
      component.onBackdropClick(fakeEvent);
      expect(emitted).toBe(true);
    });

    it('deberia NO emitir close si target !== currentTarget (click dentro del contenido)', () => {
      let emitted = false;
      component.close.subscribe(() => (emitted = true));
      const fakeEvent = {
        target: 'inner-el',
        currentTarget: 'backdrop-el',
      } as unknown as MouseEvent;
      component.onBackdropClick(fakeEvent);
      expect(emitted).toBe(false);
    });
  });
});
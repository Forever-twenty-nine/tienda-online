import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'tienda-online' title`, () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    // @ts-ignore - title is protected in the component but we can read it in tests if needed or test the signal value
    expect(app['title']()).toEqual('tienda-online');
  });
});

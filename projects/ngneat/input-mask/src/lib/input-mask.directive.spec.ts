import { ApplicationRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { InputMaskModule } from './input-mask.module';
import { createMask } from './constants';
import { InputmaskOptions } from './types';
import { fakeAsync } from '@angular/core/testing';

@Component({
  selector: 'lib-custom-input',
  template: `<input
    *ngIf="!isAsync"
    class="lib-custom-input"
    [formControl]="formControl"
    [inputMask]="inputMask"
    [placeholder]="placeholder"
  />`,
})
class CustomInputComponent implements OnInit {
  @Input() formControl!: FormControl;
  @Input() inputMask!: InputmaskOptions<any>;
  @Input() placeholder: string | undefined;
  @Input() isAsync = false;
  ngOnInit() {
    if (this.isAsync) {
      setTimeout(() => {
        this.isAsync = false;
      }, 1000);
    }
  }
}

@Component({
  template: `
    <input class="date" [inputMask]="dateMask" [formControl]="dateFC" />
    <input class="ip" [inputMask]="ipAddressMask" [formControl]="ipFC" />
    <input class="initDate" [inputMask]="dateMask" [formControl]="initDateFC" />
    <input class="phone" [inputMask]="phoneMask" [formControl]="phoneFC" />
    <input
      class="dynamic"
      [inputMask]="dynamicMask"
      [formControl]="dynamicMaskFC"
    />
    <lib-custom-input
      [formControl]="dateFCCustom"
      [inputMask]="dateMask"
      [isAsync]="isAsync"
      placeholder="Date"
    ></lib-custom-input>
  `,
})
class TestComponent {
  dateMask = createMask({
    alias: 'datetime',
    inputFormat: 'dd/mm/yyyy',
    parser: (value: string) => {
      const values = value.split('/');
      const year = +values[2];
      const month = +values[1] - 1;
      const date = +values[0];
      return new Date(year, month, date);
    },
  });
  dateFC = new FormControl('', [Validators.required]);
  initDateFC = new FormControl('28/02/1992');

  ipAddressMask = createMask({ alias: 'ip' });
  ipFC = new FormControl('');

  phoneFC = new FormControl({ value: '', disabled: true });
  phoneMask = createMask('(999) 999-9999');

  dynamicMask: InputmaskOptions<unknown> | null = null;
  dynamicMaskFC = new FormControl();

  dateFCCustom = new FormControl('');
  isAsync = false;
}

describe('InputMaskDirective', () => {
  let spectator: Spectator<TestComponent>;
  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [ReactiveFormsModule, InputMaskModule.forRoot({ isAsync: true })],
    declarations: [CustomInputComponent],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should get the instance', () => {
    const instance = spectator.component;
    expect(instance).toBeDefined();
  });

  it('should update the UI value as per mask', () => {
    const input = spectator.query('.date') as HTMLInputElement;
    spectator.typeInElement('28021992', '.date');
    expect(input.value).toEqual('28/02/1992');
    spectator.typeInElement('111111111111', '.ip');
    expect(spectator.component.ipFC.value).toEqual('111.111.111.111');
  });

  it('should update the control value as per mask parser', () => {
    spectator.typeInElement('28021992', '.date');
    expect(spectator.component.dateFC.value).toEqual(new Date(1992, 1, 28));
  });

  it('should keep the existing validators', () => {
    expect(spectator.component.dateFC.invalid).toBeTrue();
    expect(spectator.component.dateFC.errors).toHaveProperty('required');
    expect(spectator.component.dateFC.errors).not.toHaveProperty('inputMask');

    spectator.typeInElement('28', '.date');
    expect(spectator.component.dateFC.invalid).toBeTrue();
    expect(spectator.component.dateFC.errors).not.toHaveProperty('required');
    expect(spectator.component.dateFC.errors).toHaveProperty('inputMask');
  });

  it('should make form control invalid for non-compliant value', () => {
    spectator.typeInElement('28', '.date');
    expect(spectator.component.dateFC.invalid).toBeTrue();
    spectator.typeInElement('1', '.ip');
    expect(spectator.component.ipFC.invalid).toBeTrue();
  });

  it('should render with initial value', () => {
    const input = spectator.query('.initDate') as HTMLInputElement;
    expect(input.value).toEqual('28/02/1992');
  });

  it('should update the non-native UI value as per mask', () => {
    const input = spectator.query('.lib-custom-input') as HTMLInputElement;
    spectator.typeInElement('28021992', input);
    expect(input.value).toEqual('28/02/1992');
  });

  it('should update the non-native control value as per mask parser', () => {
    spectator.typeInElement('28021992', '.lib-custom-input');
    expect(spectator.component.dateFCCustom.value).toEqual(
      new Date(1992, 1, 28)
    );
  });

  it('should make non-native form control invalid for non-compliant value', () => {
    spectator.typeInElement('28', '.lib-custom-input');
    expect(spectator.component.dateFCCustom.invalid).toBeTrue();
  });

  it('should render non-native with initial value', () => {
    spectator.component.dateFCCustom.setValue('28/02/1992');
    const input = spectator.query('.lib-custom-input') as HTMLInputElement;
    expect(input.value).toEqual('28/02/1992');
  });

  it('should capture the input asynchronously', fakeAsync(() => {
    spectator.component.isAsync = true;
    spectator.detectChanges();

    let input = spectator.query('.lib-custom-input') as HTMLInputElement;
    expect(input).toBeNull();

    spectator.component.isAsync = false;
    spectator.detectChanges();

    spectator.tick(1000);

    input = spectator.query('.lib-custom-input') as HTMLInputElement;
    spectator.component.dateFCCustom.setValue('28/02/1992');
    expect(input.value).toEqual('28/02/1992');
  }));

  it('should disable the input if the disabled property was provided through a FormControl options', () => {
    expect(spectator.query('.phone')).toHaveAttribute('disabled');
    spectator.component.phoneFC.enable();
    expect(spectator.query('.phone')).not.toHaveAttribute('disabled');
  });

  it('should be possible to update the `inputMask` binding dynamically', () => {
    spectator.component.dynamicMask = spectator.component.ipAddressMask;
    spectator.detectComponentChanges();
    spectator.typeInElement('111111111111', '.dynamic');
    expect(spectator.component.dynamicMaskFC.value).toEqual('111.111.111.111');

    spectator.component.dynamicMask = spectator.component.dateMask;
    spectator.detectComponentChanges();
    spectator.typeInElement('28021992', '.dynamic');
    expect(spectator.component.dynamicMaskFC.value).toEqual(
      new Date(1992, 1, 28)
    );
  });
});

describe('Change detection', () => {
  @Component({
    template:
      '<input class="ip" [inputMask]="ipAddressMask" [formControl]="ipFC" />',
  })
  class ChangeDetectionTestComponent {
    ipAddressMask = createMask({ alias: 'ip' });
    ipFC = new FormControl('');
  }

  const createComponent = createComponentFactory({
    component: ChangeDetectionTestComponent,
    imports: [InputMaskModule, ReactiveFormsModule],
  });

  it('should not run change detections when `mouseenter`, `mouseleave` and `click` events are fired on the input', () => {
    // Arrange
    const spectator = createComponent();
    const appRef = spectator.inject(ApplicationRef);
    const spy = spyOn(appRef, 'tick').and.callThrough();
    const input = spectator.query('input') as HTMLInputElement;
    // Act
    // Caretaker note: `spectator.dispatchMouseEvent` is not used here explicitly
    // since it runs `detectChanges()` internally.
    input.dispatchEvent(new MouseEvent('mouseenter'));
    input.dispatchEvent(new MouseEvent('mouseleave'));
    input.dispatchEvent(new MouseEvent('click'));
    // Assert
    expect(spy).toHaveBeenCalledTimes(0);
  });
});

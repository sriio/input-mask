import { isPlatformServer } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  PLATFORM_ID,
  Renderer2,
  Self,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NgControl,
  Validator,
} from '@angular/forms';
import _Inputmask from 'inputmask';
import type Inputmask from 'inputmask';
import { InputMaskConfig, INPUT_MASK_CONFIG } from './config';
import { InputmaskOptions } from './types';

// The initial issue: https://github.com/ngneat/input-mask/issues/40
// Webpack 5 has module resolution changes. Libraries should configure the `output.export`
// (https://webpack.js.org/configuration/output/#outputlibraryexport) property when published in
// a UMD format, to tell Webpack that there's a default export.
// The `_Inputmask` is an object with 2 properties: `{ __esModule: true, default: Inputmask }`.
// But we want to be backwards-compatible, so we try to read the `default` property first; otherwise, we fall back to `_Inputmask`.

// eslint-disable-next-line @typescript-eslint/naming-convention
const InputmaskConstructor =
  (_Inputmask as unknown as { default?: Inputmask.Static }).default ||
  _Inputmask;

@Directive({
  selector: '[inputMask]',
})
export class InputMaskDirective<T = any>
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator
{
  /**
   *Helps you to create input-mask based on https://github.com/RobinHerbots/Inputmask
   *Supports form-validation out-of-the box.
   *Visit https://github.com/ngneat/input-mask for more info.
   */
  @Input() inputMask: InputmaskOptions<T> = {};
  inputMaskPlugin: Inputmask.Instance | undefined;
  nativeInputElement: HTMLInputElement | undefined;
  defaultInputMaskConfig = new InputMaskConfig();
  private mutationObserver: MutationObserver | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private elementRef: ElementRef<HTMLInputElement | any>,
    private renderer: Renderer2,
    @Optional() @Self() public ngControl: NgControl | null,
    @Inject(INPUT_MASK_CONFIG) config: InputMaskConfig,
    private ngZone: NgZone
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.setNativeInputElement(config);
  }

  @HostListener('input', ['$event.target.value'])
  onInput = (_: any) => {};

  @HostListener('blur', ['$event.target.value'])
  onTouched = (_: any) => {};

  ngOnInit() {
    if (this.control) {
      this.control.setValidators(
        this.control.validator
          ? [this.control.validator, this.validate]
          : [this.validate]
      );

      this.control.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.inputMaskPlugin?.remove();
    this.mutationObserver?.disconnect();
  }

  initInputMask() {
    if (
      isPlatformServer(this.platformId) ||
      !this.nativeInputElement ||
      !Object.keys(this.inputMask).length
    ) {
      return;
    }

    this.inputMaskPlugin = this.ngZone.runOutsideAngular(() =>
      new InputmaskConstructor(this.inputMaskOptions).mask(
        this.nativeInputElement as HTMLInputElement
      )
    );

    if (this.control) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control!.updateValueAndValidity();
      });
    }
  }

  ngAfterViewInit() {
    this.initInputMask();
  }

  get inputMaskOptions(): Inputmask.Options {
    const { parser, ...options } = this.inputMask;
    return options;
  }

  writeValue(value: string): void {
    if (this.nativeInputElement) {
      this.renderer.setProperty(this.nativeInputElement, 'value', value ?? '');
    }
  }

  registerOnChange(fn: (_: T | null) => void): void {
    const parser = this.inputMask.parser;
    this.onInput = (value) => {
      fn(parser && value ? parser(value) : value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate = (control: AbstractControl): { [key: string]: any } | null => !control.value ||
      !this.inputMaskPlugin ||
      this.inputMaskPlugin.isValid()
      ? null
      : { inputMask: true };

  setDisabledState(disabled: boolean): void {
    if (this.nativeInputElement) {
      this.renderer.setProperty(this.nativeInputElement, 'disabled', disabled);
    }
  }

  private get control(): AbstractControl | null | undefined {
    return this.ngControl?.control;
  }

  private setNativeInputElement(config: InputMaskConfig) {
    if (this.elementRef.nativeElement.tagName === 'INPUT') {
      this.nativeInputElement = this.elementRef.nativeElement;
    } else {
      this.defaultInputMaskConfig = {
        ...this.defaultInputMaskConfig,
        ...config,
      };
      if (this.defaultInputMaskConfig.isAsync) {
        // Create an observer instance linked to the callback function
        this.mutationObserver = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              const nativeInputElement =
                this.elementRef.nativeElement.querySelector(
                  this.defaultInputMaskConfig.inputSelector
                );
              if (nativeInputElement) {
                this.nativeInputElement = nativeInputElement;
                this.mutationObserver?.disconnect();
                this.initInputMask();
              }
            }
          }
        });

        // Start observing the target node for configured mutations
        this.mutationObserver.observe(this.elementRef.nativeElement, {
          childList: true,
          subtree: true,
        });
      } else {
        this.nativeInputElement = this.elementRef.nativeElement.querySelector(
          this.defaultInputMaskConfig.inputSelector
        );
      }
    }
  }
}

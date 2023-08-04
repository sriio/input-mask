/* eslint-disable @typescript-eslint/member-ordering */
import { isPlatformServer } from '@angular/common';
import { Directive, HostListener, Inject, Input, Optional, PLATFORM_ID, Self, } from '@angular/core';
import _Inputmask from 'inputmask';
import { InputMaskConfig, INPUT_MASK_CONFIG } from './config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "./config";
// The initial issue: https://github.com/ngneat/input-mask/issues/40
// Webpack 5 has module resolution changes. Libraries should configure the `output.export`
// (https://webpack.js.org/configuration/output/#outputlibraryexport) property when published in
// a UMD format, to tell Webpack that there's a default export.
// The `_Inputmask` is an object with 2 properties: `{ __esModule: true, default: Inputmask }`.
// But we want to be backwards-compatible, so we try to read the `default` property first; otherwise, we fall back to `_Inputmask`.
// eslint-disable-next-line @typescript-eslint/naming-convention
const InputmaskConstructor = _Inputmask.default ||
    _Inputmask;
export class InputMaskDirective {
    constructor(platformId, elementRef, renderer, ngControl, config, ngZone) {
        this.platformId = platformId;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.ngControl = ngControl;
        this.ngZone = ngZone;
        this.inputMaskPlugin = null;
        this.nativeInputElement = null;
        this.defaultInputMaskConfig = new InputMaskConfig();
        this.inputMaskOptions = null;
        /* The original `onChange` function coming from the `setUpControl`. */
        this.onChange = () => { };
        this.mutationObserver = null;
        this.onInput = (_) => { };
        this.onTouched = (_) => { };
        this.validate = (control) => !control.value || !this.inputMaskPlugin || this.inputMaskPlugin.isValid()
            ? null
            : { inputMask: true };
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
        this.setNativeInputElement(config);
    }
    /**
     * Helps you to create input-mask based on https://github.com/RobinHerbots/Inputmask
     * Supports form-validation out-of-the box.
     * Visit https://github.com/ngneat/input-mask for more info.
     */
    set inputMask(inputMask) {
        if (inputMask) {
            this.inputMaskOptions = inputMask;
            this.updateInputMask();
        }
    }
    ngOnInit() {
        if (this.control) {
            this.control.setValidators(this.control.validator
                ? [this.control.validator, this.validate]
                : [this.validate]);
            this.control.updateValueAndValidity();
        }
    }
    ngOnDestroy() {
        this.removeInputMaskPlugin();
        this.mutationObserver?.disconnect();
    }
    writeValue(value) {
        const formatter = this.inputMaskOptions?.formatter;
        if (this.nativeInputElement) {
            this.renderer.setProperty(this.nativeInputElement, 'value', formatter && value ? formatter(value) : value ?? '');
        }
    }
    registerOnChange(onChange) {
        this.onChange = onChange;
        const parser = this.inputMaskOptions?.parser;
        this.onInput = (value) => {
            this.onChange(parser && value ? parser(value) : value);
        };
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(disabled) {
        if (this.nativeInputElement) {
            this.renderer.setProperty(this.nativeInputElement, 'disabled', disabled);
        }
    }
    updateInputMask() {
        this.removeInputMaskPlugin();
        this.createInputMaskPlugin();
        // This re-creates the `onInput` function since `inputMaskOptions` might be changed and the `parser`
        // property now differs.
        this.registerOnChange(this.onChange);
    }
    createInputMaskPlugin() {
        const { nativeInputElement, inputMaskOptions } = this;
        if (isPlatformServer(this.platformId) ||
            !nativeInputElement ||
            inputMaskOptions === null ||
            Object.keys(inputMaskOptions).length === 0) {
            return;
        }
        const { parser, formatter, ...options } = inputMaskOptions;
        this.inputMaskPlugin = this.ngZone.runOutsideAngular(() => new InputmaskConstructor(options).mask(nativeInputElement));
        if (this.control) {
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.control.updateValueAndValidity();
            });
        }
    }
    get control() {
        return this.ngControl?.control;
    }
    setNativeInputElement(config) {
        if (this.elementRef.nativeElement.tagName === 'INPUT') {
            this.nativeInputElement = this.elementRef.nativeElement;
        }
        else {
            this.defaultInputMaskConfig = {
                ...this.defaultInputMaskConfig,
                ...config,
            };
            if (this.defaultInputMaskConfig.isAsync) {
                // Create an observer instance linked to the callback function
                this.mutationObserver = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            const nativeInputElement = this.elementRef.nativeElement.querySelector(this.defaultInputMaskConfig.inputSelector);
                            if (nativeInputElement) {
                                this.nativeInputElement = nativeInputElement;
                                this.mutationObserver?.disconnect();
                                this.createInputMaskPlugin();
                            }
                        }
                    }
                });
                // Start observing the target node for configured mutations
                this.mutationObserver.observe(this.elementRef.nativeElement, {
                    childList: true,
                    subtree: true,
                });
            }
            else {
                this.nativeInputElement = this.elementRef.nativeElement.querySelector(this.defaultInputMaskConfig.inputSelector);
            }
        }
    }
    removeInputMaskPlugin() {
        this.inputMaskPlugin?.remove();
        this.inputMaskPlugin = null;
    }
}
InputMaskDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.8", ngImport: i0, type: InputMaskDirective, deps: [{ token: PLATFORM_ID }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i1.NgControl, optional: true, self: true }, { token: INPUT_MASK_CONFIG }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
InputMaskDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.8", type: InputMaskDirective, selector: "[inputMask]", inputs: { inputMask: "inputMask" }, host: { listeners: { "input": "onInput($event.target.value)", "blur": "onTouched($event.target.value)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.8", ngImport: i0, type: InputMaskDirective, decorators: [{
            type: Directive,
            args: [{
                    // eslint-disable-next-line @angular-eslint/directive-selector
                    selector: '[inputMask]',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.NgControl, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }, { type: i2.InputMaskConfig, decorators: [{
                    type: Inject,
                    args: [INPUT_MASK_CONFIG]
                }] }, { type: i0.NgZone }]; }, propDecorators: { inputMask: [{
                type: Input
            }], onInput: [{
                type: HostListener,
                args: ['input', ['$event.target.value']]
            }], onTouched: [{
                type: HostListener,
                args: ['blur', ['$event.target.value']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbWFzay5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ25lYXQvaW5wdXQtbWFzay9zcmMvbGliL2lucHV0LW1hc2suZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHVEQUF1RDtBQUN2RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsU0FBUyxFQUVULFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUlMLFFBQVEsRUFDUixXQUFXLEVBRVgsSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBUXZCLE9BQU8sVUFBVSxNQUFNLFdBQVcsQ0FBQztBQUluQyxPQUFPLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sVUFBVSxDQUFDOzs7O0FBRTlELG9FQUFvRTtBQUNwRSwwRkFBMEY7QUFDMUYsZ0dBQWdHO0FBQ2hHLCtEQUErRDtBQUMvRCwrRkFBK0Y7QUFDL0YsbUlBQW1JO0FBRW5JLGdFQUFnRTtBQUNoRSxNQUFNLG9CQUFvQixHQUN2QixVQUF3RCxDQUFDLE9BQU87SUFDakUsVUFBVSxDQUFDO0FBTWIsTUFBTSxPQUFPLGtCQUFrQjtJQThCN0IsWUFDK0IsVUFBa0IsRUFDdkMsVUFBOEMsRUFDOUMsUUFBbUIsRUFDQSxTQUEyQixFQUMzQixNQUF1QixFQUMxQyxNQUFjO1FBTE8sZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUN2QyxlQUFVLEdBQVYsVUFBVSxDQUFvQztRQUM5QyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ0EsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFFOUMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWpCeEIsb0JBQWUsR0FBOEIsSUFBSSxDQUFDO1FBQ2xELHVCQUFrQixHQUE0QixJQUFJLENBQUM7UUFDbkQsMkJBQXNCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUV2QyxxQkFBZ0IsR0FBK0IsSUFBSSxDQUFDO1FBRTVELHNFQUFzRTtRQUM5RCxhQUFRLEdBQThCLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUUvQyxxQkFBZ0IsR0FBNEIsSUFBSSxDQUFDO1FBaUJ6RCxZQUFPLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUd6QixjQUFTLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQztRQTBDM0IsYUFBUSxHQUFHLENBQUMsT0FBd0IsRUFBMkIsRUFBRSxDQUMvRCxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFO1lBQ3ZFLENBQUMsQ0FBQyxJQUFJO1lBQ04sQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1FBdkR4QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztTQUNyQztRQUNELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBcENEOzs7O09BSUc7SUFDSCxJQUNJLFNBQVMsQ0FBQyxTQUFpRDtRQUM3RCxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7WUFDbEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQWlDRCxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVM7Z0JBQ3BCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3pDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FDcEIsQ0FBQztZQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUN2QztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYTtRQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDO1FBQ25ELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUN2QixJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLE9BQU8sRUFDUCxTQUFTLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQ3BELENBQUM7U0FDSDtJQUNILENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxRQUFtQztRQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO1FBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELGlCQUFpQixDQUFDLEVBQWdCO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFPRCxnQkFBZ0IsQ0FBQyxRQUFpQjtRQUNoQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzFFO0lBQ0gsQ0FBQztJQUVPLGVBQWU7UUFDckIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0Isb0dBQW9HO1FBQ3BHLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxxQkFBcUI7UUFDM0IsTUFBTSxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXRELElBQ0UsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNqQyxDQUFDLGtCQUFrQjtZQUNuQixnQkFBZ0IsS0FBSyxJQUFJO1lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUMxQztZQUNBLE9BQU87U0FDUjtRQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsZ0JBQWdCLENBQUM7UUFDM0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUN4RCxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUMzRCxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2Qsb0VBQW9FO2dCQUNwRSxJQUFJLENBQUMsT0FBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRCxJQUFZLE9BQU87UUFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRU8scUJBQXFCLENBQUMsTUFBdUI7UUFDbkQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3JELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztTQUN6RDthQUFNO1lBQ0wsSUFBSSxDQUFDLHNCQUFzQixHQUFHO2dCQUM1QixHQUFHLElBQUksQ0FBQyxzQkFBc0I7Z0JBQzlCLEdBQUcsTUFBTTthQUNWLENBQUM7WUFDRixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3ZDLDhEQUE4RDtnQkFDOUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLEVBQUUsRUFBRTtvQkFDN0QsS0FBSyxNQUFNLFFBQVEsSUFBSSxhQUFhLEVBQUU7d0JBQ3BDLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7NEJBQ2pDLE1BQU0sa0JBQWtCLEdBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FDekMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FDMUMsQ0FBQzs0QkFDSixJQUFJLGtCQUFrQixFQUFFO2dDQUN0QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7Z0NBQzdDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsQ0FBQztnQ0FDcEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7NkJBQzlCO3lCQUNGO3FCQUNGO2dCQUNILENBQUMsQ0FBQyxDQUFDO2dCQUVILDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtvQkFDM0QsU0FBUyxFQUFFLElBQUk7b0JBQ2YsT0FBTyxFQUFFLElBQUk7aUJBQ2QsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FDbkUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FDMUMsQ0FBQzthQUNIO1NBQ0Y7SUFDSCxDQUFDO0lBRU8scUJBQXFCO1FBQzNCLElBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQzs7K0dBcExVLGtCQUFrQixrQkErQm5CLFdBQVcscUhBSVgsaUJBQWlCO21HQW5DaEIsa0JBQWtCOzJGQUFsQixrQkFBa0I7a0JBSjlCLFNBQVM7bUJBQUM7b0JBQ1QsOERBQThEO29CQUM5RCxRQUFRLEVBQUUsYUFBYTtpQkFDeEI7OzBCQWdDSSxNQUFNOzJCQUFDLFdBQVc7OzBCQUdsQixRQUFROzswQkFBSSxJQUFJOzswQkFDaEIsTUFBTTsyQkFBQyxpQkFBaUI7aUVBdkJ2QixTQUFTO3NCQURaLEtBQUs7Z0JBa0NOLE9BQU87c0JBRE4sWUFBWTt1QkFBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztnQkFJOUMsU0FBUztzQkFEUixZQUFZO3VCQUFDLE1BQU0sRUFBRSxDQUFDLHFCQUFxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L21lbWJlci1vcmRlcmluZyAqL1xyXG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBIb3N0TGlzdGVuZXIsXHJcbiAgSW5qZWN0LFxyXG4gIElucHV0LFxyXG4gIE5nWm9uZSxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIE9wdGlvbmFsLFxyXG4gIFBMQVRGT1JNX0lELFxyXG4gIFJlbmRlcmVyMixcclxuICBTZWxmLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1xyXG4gIEFic3RyYWN0Q29udHJvbCxcclxuICBDb250cm9sVmFsdWVBY2Nlc3NvcixcclxuICBOZ0NvbnRyb2wsXHJcbiAgVmFsaWRhdGlvbkVycm9ycyxcclxuICBWYWxpZGF0b3IsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgX0lucHV0bWFzayBmcm9tICdpbnB1dG1hc2snO1xyXG5pbXBvcnQgdHlwZSBJbnB1dG1hc2sgZnJvbSAnaW5wdXRtYXNrJztcclxuXHJcbmltcG9ydCB7IElucHV0bWFza09wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHsgSW5wdXRNYXNrQ29uZmlnLCBJTlBVVF9NQVNLX0NPTkZJRyB9IGZyb20gJy4vY29uZmlnJztcclxuXHJcbi8vIFRoZSBpbml0aWFsIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vbmduZWF0L2lucHV0LW1hc2svaXNzdWVzLzQwXHJcbi8vIFdlYnBhY2sgNSBoYXMgbW9kdWxlIHJlc29sdXRpb24gY2hhbmdlcy4gTGlicmFyaWVzIHNob3VsZCBjb25maWd1cmUgdGhlIGBvdXRwdXQuZXhwb3J0YFxyXG4vLyAoaHR0cHM6Ly93ZWJwYWNrLmpzLm9yZy9jb25maWd1cmF0aW9uL291dHB1dC8jb3V0cHV0bGlicmFyeWV4cG9ydCkgcHJvcGVydHkgd2hlbiBwdWJsaXNoZWQgaW5cclxuLy8gYSBVTUQgZm9ybWF0LCB0byB0ZWxsIFdlYnBhY2sgdGhhdCB0aGVyZSdzIGEgZGVmYXVsdCBleHBvcnQuXHJcbi8vIFRoZSBgX0lucHV0bWFza2AgaXMgYW4gb2JqZWN0IHdpdGggMiBwcm9wZXJ0aWVzOiBgeyBfX2VzTW9kdWxlOiB0cnVlLCBkZWZhdWx0OiBJbnB1dG1hc2sgfWAuXHJcbi8vIEJ1dCB3ZSB3YW50IHRvIGJlIGJhY2t3YXJkcy1jb21wYXRpYmxlLCBzbyB3ZSB0cnkgdG8gcmVhZCB0aGUgYGRlZmF1bHRgIHByb3BlcnR5IGZpcnN0OyBvdGhlcndpc2UsIHdlIGZhbGwgYmFjayB0byBgX0lucHV0bWFza2AuXHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXHJcbmNvbnN0IElucHV0bWFza0NvbnN0cnVjdG9yID1cclxuICAoX0lucHV0bWFzayBhcyB1bmtub3duIGFzIHsgZGVmYXVsdD86IElucHV0bWFzay5TdGF0aWMgfSkuZGVmYXVsdCB8fFxyXG4gIF9JbnB1dG1hc2s7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L2RpcmVjdGl2ZS1zZWxlY3RvclxyXG4gIHNlbGVjdG9yOiAnW2lucHV0TWFza10nLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgSW5wdXRNYXNrRGlyZWN0aXZlPFQgPSBhbnk+XHJcbiAgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIFZhbGlkYXRvclxyXG57XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbnB1dE1hc2s6IElucHV0bWFza09wdGlvbnM8YW55PiB8IG51bGwgfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBzIHlvdSB0byBjcmVhdGUgaW5wdXQtbWFzayBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vUm9iaW5IZXJib3RzL0lucHV0bWFza1xyXG4gICAqIFN1cHBvcnRzIGZvcm0tdmFsaWRhdGlvbiBvdXQtb2YtdGhlIGJveC5cclxuICAgKiBWaXNpdCBodHRwczovL2dpdGh1Yi5jb20vbmduZWF0L2lucHV0LW1hc2sgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBASW5wdXQoKVxyXG4gIHNldCBpbnB1dE1hc2soaW5wdXRNYXNrOiBJbnB1dG1hc2tPcHRpb25zPFQ+IHwgbnVsbCB8IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKGlucHV0TWFzaykge1xyXG4gICAgICB0aGlzLmlucHV0TWFza09wdGlvbnMgPSBpbnB1dE1hc2s7XHJcbiAgICAgIHRoaXMudXBkYXRlSW5wdXRNYXNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbnB1dE1hc2tQbHVnaW46IElucHV0bWFzay5JbnN0YW5jZSB8IG51bGwgPSBudWxsO1xyXG4gIG5hdGl2ZUlucHV0RWxlbWVudDogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIGRlZmF1bHRJbnB1dE1hc2tDb25maWcgPSBuZXcgSW5wdXRNYXNrQ29uZmlnKCk7XHJcblxyXG4gIHByaXZhdGUgaW5wdXRNYXNrT3B0aW9uczogSW5wdXRtYXNrT3B0aW9uczxUPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvKiBUaGUgb3JpZ2luYWwgYG9uQ2hhbmdlYCBmdW5jdGlvbiBjb21pbmcgZnJvbSB0aGUgYHNldFVwQ29udHJvbGAuICovXHJcbiAgcHJpdmF0ZSBvbkNoYW5nZTogKHZhbHVlOiBUIHwgbnVsbCkgPT4gdm9pZCA9ICgpID0+IHt9O1xyXG5cclxuICBwcml2YXRlIG11dGF0aW9uT2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IHN0cmluZyxcclxuICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50IHwgYW55PixcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgcHVibGljIG5nQ29udHJvbDogTmdDb250cm9sIHwgbnVsbCxcclxuICAgIEBJbmplY3QoSU5QVVRfTUFTS19DT05GSUcpIGNvbmZpZzogSW5wdXRNYXNrQ29uZmlnLFxyXG4gICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZVxyXG4gICkge1xyXG4gICAgaWYgKHRoaXMubmdDb250cm9sICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5uZ0NvbnRyb2wudmFsdWVBY2Nlc3NvciA9IHRoaXM7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldE5hdGl2ZUlucHV0RWxlbWVudChjb25maWcpO1xyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcignaW5wdXQnLCBbJyRldmVudC50YXJnZXQudmFsdWUnXSlcclxuICBvbklucHV0ID0gKF86IGFueSkgPT4ge307XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInLCBbJyRldmVudC50YXJnZXQudmFsdWUnXSlcclxuICBvblRvdWNoZWQgPSAoXzogYW55KSA9PiB7fTtcclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jb250cm9sKSB7XHJcbiAgICAgIHRoaXMuY29udHJvbC5zZXRWYWxpZGF0b3JzKFxyXG4gICAgICAgIHRoaXMuY29udHJvbC52YWxpZGF0b3JcclxuICAgICAgICAgID8gW3RoaXMuY29udHJvbC52YWxpZGF0b3IsIHRoaXMudmFsaWRhdGVdXHJcbiAgICAgICAgICA6IFt0aGlzLnZhbGlkYXRlXVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5jb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZW1vdmVJbnB1dE1hc2tQbHVnaW4oKTtcclxuICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xyXG4gIH1cclxuXHJcbiAgd3JpdGVWYWx1ZSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBmb3JtYXR0ZXIgPSB0aGlzLmlucHV0TWFza09wdGlvbnM/LmZvcm1hdHRlcjtcclxuICAgIGlmICh0aGlzLm5hdGl2ZUlucHV0RWxlbWVudCkge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFByb3BlcnR5KFxyXG4gICAgICAgIHRoaXMubmF0aXZlSW5wdXRFbGVtZW50LFxyXG4gICAgICAgICd2YWx1ZScsXHJcbiAgICAgICAgZm9ybWF0dGVyICYmIHZhbHVlID8gZm9ybWF0dGVyKHZhbHVlKSA6IHZhbHVlID8/ICcnXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKG9uQ2hhbmdlOiAodmFsdWU6IFQgfCBudWxsKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLm9uQ2hhbmdlID0gb25DaGFuZ2U7XHJcbiAgICBjb25zdCBwYXJzZXIgPSB0aGlzLmlucHV0TWFza09wdGlvbnM/LnBhcnNlcjtcclxuICAgIHRoaXMub25JbnB1dCA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICB0aGlzLm9uQ2hhbmdlKHBhcnNlciAmJiB2YWx1ZSA/IHBhcnNlcih2YWx1ZSkgOiB2YWx1ZSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IFZvaWRGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcclxuICB9XHJcblxyXG4gIHZhbGlkYXRlID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+XHJcbiAgICAhY29udHJvbC52YWx1ZSB8fCAhdGhpcy5pbnB1dE1hc2tQbHVnaW4gfHwgdGhpcy5pbnB1dE1hc2tQbHVnaW4uaXNWYWxpZCgpXHJcbiAgICAgID8gbnVsbFxyXG4gICAgICA6IHsgaW5wdXRNYXNrOiB0cnVlIH07XHJcblxyXG4gIHNldERpc2FibGVkU3RhdGUoZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5hdGl2ZUlucHV0RWxlbWVudCkge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFByb3BlcnR5KHRoaXMubmF0aXZlSW5wdXRFbGVtZW50LCAnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUlucHV0TWFzaygpOiB2b2lkIHtcclxuICAgIHRoaXMucmVtb3ZlSW5wdXRNYXNrUGx1Z2luKCk7XHJcbiAgICB0aGlzLmNyZWF0ZUlucHV0TWFza1BsdWdpbigpO1xyXG4gICAgLy8gVGhpcyByZS1jcmVhdGVzIHRoZSBgb25JbnB1dGAgZnVuY3Rpb24gc2luY2UgYGlucHV0TWFza09wdGlvbnNgIG1pZ2h0IGJlIGNoYW5nZWQgYW5kIHRoZSBgcGFyc2VyYFxyXG4gICAgLy8gcHJvcGVydHkgbm93IGRpZmZlcnMuXHJcbiAgICB0aGlzLnJlZ2lzdGVyT25DaGFuZ2UodGhpcy5vbkNoYW5nZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUlucHV0TWFza1BsdWdpbigpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgbmF0aXZlSW5wdXRFbGVtZW50LCBpbnB1dE1hc2tPcHRpb25zIH0gPSB0aGlzO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpIHx8XHJcbiAgICAgICFuYXRpdmVJbnB1dEVsZW1lbnQgfHxcclxuICAgICAgaW5wdXRNYXNrT3B0aW9ucyA9PT0gbnVsbCB8fFxyXG4gICAgICBPYmplY3Qua2V5cyhpbnB1dE1hc2tPcHRpb25zKS5sZW5ndGggPT09IDBcclxuICAgICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBwYXJzZXIsIGZvcm1hdHRlciwgLi4ub3B0aW9ucyB9ID0gaW5wdXRNYXNrT3B0aW9ucztcclxuICAgIHRoaXMuaW5wdXRNYXNrUGx1Z2luID0gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cclxuICAgICAgbmV3IElucHV0bWFza0NvbnN0cnVjdG9yKG9wdGlvbnMpLm1hc2sobmF0aXZlSW5wdXRFbGVtZW50KVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb250cm9sKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXHJcbiAgICAgICAgdGhpcy5jb250cm9sIS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXQgY29udHJvbCgpOiBBYnN0cmFjdENvbnRyb2wgfCBudWxsIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLm5nQ29udHJvbD8uY29udHJvbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0TmF0aXZlSW5wdXRFbGVtZW50KGNvbmZpZzogSW5wdXRNYXNrQ29uZmlnKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xyXG4gICAgICB0aGlzLm5hdGl2ZUlucHV0RWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5kZWZhdWx0SW5wdXRNYXNrQ29uZmlnID0ge1xyXG4gICAgICAgIC4uLnRoaXMuZGVmYXVsdElucHV0TWFza0NvbmZpZyxcclxuICAgICAgICAuLi5jb25maWcsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmICh0aGlzLmRlZmF1bHRJbnB1dE1hc2tDb25maWcuaXNBc3luYykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBhbiBvYnNlcnZlciBpbnN0YW5jZSBsaW5rZWQgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9uc0xpc3QpID0+IHtcclxuICAgICAgICAgIGZvciAoY29uc3QgbXV0YXRpb24gb2YgbXV0YXRpb25zTGlzdCkge1xyXG4gICAgICAgICAgICBpZiAobXV0YXRpb24udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcclxuICAgICAgICAgICAgICBjb25zdCBuYXRpdmVJbnB1dEVsZW1lbnQgPVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0SW5wdXRNYXNrQ29uZmlnLmlucHV0U2VsZWN0b3JcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgaWYgKG5hdGl2ZUlucHV0RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYXRpdmVJbnB1dEVsZW1lbnQgPSBuYXRpdmVJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlSW5wdXRNYXNrUGx1Z2luKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IG9ic2VydmluZyB0aGUgdGFyZ2V0IG5vZGUgZm9yIGNvbmZpZ3VyZWQgbXV0YXRpb25zXHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHtcclxuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgICAgICAgIHN1YnRyZWU6IHRydWUsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5uYXRpdmVJbnB1dEVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgdGhpcy5kZWZhdWx0SW5wdXRNYXNrQ29uZmlnLmlucHV0U2VsZWN0b3JcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZUlucHV0TWFza1BsdWdpbigpOiB2b2lkIHtcclxuICAgIHRoaXMuaW5wdXRNYXNrUGx1Z2luPy5yZW1vdmUoKTtcclxuICAgIHRoaXMuaW5wdXRNYXNrUGx1Z2luID0gbnVsbDtcclxuICB9XHJcbn1cclxuIl19
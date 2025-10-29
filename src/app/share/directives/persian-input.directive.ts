import {Directive, HostListener, ElementRef} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[persianInput]',
  standalone: true
})
export class PersianInputDirective {

  constructor(private el: ElementRef, private control: NgControl) {
  }

  private toPersian(str: string): string {
    return str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
  }

  private toEnglish(str: string): string {
    return str.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  }

  @HostListener('input', ['$event'])
  onInput() {
    const input = this.el.nativeElement as HTMLInputElement;
    const rawValue = input.value;
    const cleaned = rawValue.replace(/[^\d۰-۹]/g, '');
    const englishValue = this.toEnglish(cleaned);
    const persianValue = this.toPersian(englishValue);

    input.value = persianValue;

    if (this.control.control) {
      this.control.control.setValue(englishValue, {emitEvent: false});
    }

    input.dispatchEvent(new Event('input'));
  }

  ngAfterViewInit() {
    this.control.valueChanges?.subscribe(value => {
      if (value && typeof value === 'string') {
        const persian = this.toPersian(value.replace(/\D/g, ''));
        if (this.el.nativeElement.value !== persian) {
          this.el.nativeElement.value = persian;
        }
      }
    });
  }
}

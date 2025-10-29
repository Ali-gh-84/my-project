import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'persianDigits',
  standalone: true
})
export class PersianDigitsPipe implements PipeTransform {

  private readonly persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  transform(value: string | number | null | undefined): string {
    if (value == null) return '';
    return String(value).replace(/\d/g, digit => this.persian[+digit]);
  }
}

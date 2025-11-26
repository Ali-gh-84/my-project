import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    if (!value) return '';
    const enhanced = value
      .replace(/<h1>/g, '<h1 class="text-danger fw-bold mt-4 mb-3 border-bottom pb-2">')
      .replace(/<\/h1>/g, '</h1>')
      .replace(/<h2>/g, '<h2 class="text-danger fw-bold mt-4 mb-3 border-bottom pb-2">')
      .replace(/<\/h2>/g, '</h2>')
      .replace(/<h3>/g, '<h3 class="text-danger fw-bold mt-4 mb-3 border-bottom pb-2">')
      .replace(/<\/h3>/g, '</h3>')
      .replace(/<p>/g, '<p class="mb-3 fs-6 lh-lg text-justify">')
      .replace(/<span style="color: rgb$$ 182, 2, 5 $$;">/g, '<span class="text-danger fw-bold">')
      .replace(/·/g, '<i class="bi bi-dot text-warning me-2"></i>')
      .replace(/\d+\./g, '<span class="badge bg-primary me-2">$&</span>');

    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }
}

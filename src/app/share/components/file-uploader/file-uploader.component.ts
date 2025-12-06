// file-uploader.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() type: 'image' | 'document' = 'document';
  @Input() accept = '.pdf,.jpg,.jpeg,.png';
  @Input() loading = false;
  @Input() multiple = false;
  @Input() placeholder = 'فایل را انتخاب کنید';
  @Input() folderName = 'applicant-documents';
  @Input() disabled: boolean = false;

  @Output() upload = new EventEmitter<FileList>();
  @Output() remove = new EventEmitter<void>();

  files: { name: string, url?: string }[] = [];
  isDragging = false;

  ngOnInit() {

    const control = this.form.get(this.controlName);
    if (control?.value) {
      this.files = control.value;
    }

    if (this.form && this.controlName) {
      const control = this.form.get(this.controlName);
      if (control?.value) {
        this.files = Array.isArray(control.value) ? control.value : [control.value];
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    this.upload.emit(input.files);
    input.value = '';
  }

  onFileSelectedMultiple(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.upload.emit(input.files);
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    if (this.form && this.controlName) {
      const control = this.form.get(this.controlName);
      if (control) {
        control.setValue(this.files.length > 0 ? this.files : null);
      }
    }
    this.remove.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.upload.emit(event.dataTransfer.files);
    }
  }
}

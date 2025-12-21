import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {NgIf, NgStyle} from '@angular/common';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {MainPageService} from '../../../module/mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  imports: [
    NgIf,
    NzIconDirective,
    NgStyle
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
  tenantSection!: number;
  tenantId!: number;
  theme: any = {};

  constructor(
    private mainPageService: MainPageService,
    private route: ActivatedRoute,
    private router: Router,) {
  }

  ngOnInit() {

    this.mainPageService.currentTenant$.subscribe(tenantData => {
      if (tenantData) {
        this.tenantId = tenantData.tenantId;
        this.tenantSection = tenantData.section;
        this.theme = tenantData.theme;
        console.log('Theme loaded from service:', this.theme);
        return;
      }
    });

    const stored = this.mainPageService.getCurrentTenantFromStorage();
    if (stored) {
      this.tenantId = stored.tenantId;
      this.tenantSection = stored.section;
      this.theme = stored.theme;

      this.mainPageService.setCurrentTenant(stored.tenantId, stored.section);
    } else {
      this.router.navigate(['/']);
    }

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

  onFileSelectedMultiple(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.upload.emit(input.files);
    }
    input.value = '';
  }

  hasFile(): boolean {
    return !!this.form?.get(this.controlName)?.value?.url;
  }

  handleClick(): void {
    if (this.hasFile()) {
      this.remove.emit();
    } else {
      const input = document.getElementById(this.controlName + '_input') as HTMLInputElement;
      input?.click();
    }
  }
}

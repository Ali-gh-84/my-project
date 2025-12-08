import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {NgIf} from '@angular/common';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {MainPageService} from '../../../module/mainpagecomponent/main-page.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  imports: [
    NgIf,
    NzIconDirective
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

    const tenantIdFromRoute = this.route.snapshot.paramMap.get('tenantId');
    const tid = +tenantIdFromRoute!;

    if (!tenantIdFromRoute || isNaN(tid)) {
      this.router.navigate(['/']);
      return;
    }

    const periodInfo = this.mainPageService.periodInformations.value;

    if (periodInfo && periodInfo.tenantId === tid) {
      console.log('yes')
      this.tenantId = periodInfo.tenantId;
      this.tenantSection = periodInfo.section;
    } else {
      this.tenantId = tid;
      this.tenantSection = tid;
    }

    this.mainPageService.getTenantList().subscribe(cards => {
      const currentTenant = cards.find(c => +c.id === tid || c.section === tid);
      if (currentTenant) {
        this.tenantSection = currentTenant.section;
        this.theme = this.mainPageService.getTenantTheme(this.tenantSection);
      }
    });

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
